using System.Text;
using EduOps.Api.Middleware;
using EduOps.Application;
using EduOps.Infrastructure;
using Hangfire;
using Hangfire.PostgreSql;
using Polly;
using Polly.Extensions.Http;
using Microsoft.AspNetCore.Authorization;
using EduOps.Api.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FluentValidation.AspNetCore;
using FluentValidation;
using Serilog;
using System;
using System.Security.Claims;

// Load Configuration thủ công trước khi Builder chạy để cấp cho Serilog
var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env}.json", optional: true)
    .Build();

// Định dạng Log chuẩn Doanh nghiệp (Enterprise Standard) với Context siêu chi tiết
var outputTemplate = "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff}] [{Level:u3}] [CID:{CorrelationId}] [IP:{ClientIp}] [Org:{OrgId}] [User:{UserEmail}] [{SourceContext}] {Message:lj}{NewLine}{Exception}";

long fileSizeLimit = configuration.GetValue<long>("SerilogSettings:FileSizeLimitBytes", 10485760);
int retainedFileCount = configuration.GetValue<int>("SerilogSettings:RetainedFileCountLimit", 30);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithCorrelationId()
    .WriteTo.Console(outputTemplate: outputTemplate)
    .WriteTo.Map(
        evt => evt.Timestamp.ToString("yyyy-MM") + "/" + evt.Timestamp.ToString("dd"),
        (dateFolder, wt) =>
        {
            // 1. System Log (Mọi thứ)
            wt.File($"Logs/{dateFolder}/System/system-.txt",
                rollingInterval: RollingInterval.Hour,
                outputTemplate: outputTemplate,
                fileSizeLimitBytes: fileSizeLimit,
                retainedFileCountLimit: retainedFileCount);

            // 2. Error/Fatal Logs
            wt.Logger(lc => lc
                .Filter.ByIncludingOnly(e => e.Level == Serilog.Events.LogEventLevel.Error || e.Level == Serilog.Events.LogEventLevel.Fatal)
                .WriteTo.File($"Logs/{dateFolder}/Severity/errors-.txt",
                    rollingInterval: RollingInterval.Hour, outputTemplate: outputTemplate, retainedFileCountLimit: retainedFileCount));

            // 3. Warning Logs
            wt.Logger(lc => lc
                .Filter.ByIncludingOnly(e => e.Level == Serilog.Events.LogEventLevel.Warning)
                .WriteTo.File($"Logs/{dateFolder}/Severity/warnings-.txt",
                    rollingInterval: RollingInterval.Hour, outputTemplate: outputTemplate, retainedFileCountLimit: retainedFileCount));

            // 4. Các luồng Business / Audit
            wt.Logger(lc => lc
                .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("LogCategory"))
                .WriteTo.Map(
                    e => e.Properties["LogCategory"].ToString().Trim('"'),
                    (category, subWt) =>
                    {
                        if (category.StartsWith("Audit_"))
                        {
                            var action = category.Replace("Audit_", "").ToLower();
                            subWt.File($"Logs/{dateFolder}/Audit/{action}-.txt",
                                rollingInterval: RollingInterval.Hour, outputTemplate: outputTemplate, retainedFileCountLimit: retainedFileCount);
                        }
                        else
                        {
                            subWt.File($"Logs/{dateFolder}/Business/{category.ToLower()}-.txt",
                                rollingInterval: RollingInterval.Hour, outputTemplate: outputTemplate, retainedFileCountLimit: retainedFileCount);
                        }
                    }
                ));
            
            // 5. Traffic / Requests Log
            wt.Logger(lc => lc
                .Filter.ByIncludingOnly(e => e.Properties.ContainsKey("SourceContext") && e.Properties["SourceContext"].ToString().Contains("Microsoft.AspNetCore.Hosting.Diagnostics"))
                .WriteTo.File($"Logs/{dateFolder}/Traffic/requests-.txt",
                    rollingInterval: RollingInterval.Hour, outputTemplate: outputTemplate, retainedFileCountLimit: retainedFileCount));
        }
    )
    .CreateLogger();

try
{
    Log.Information("Starting web application");
    var builder = WebApplication.CreateBuilder(args);

    // Chuyển toàn bộ Log của ứng dụng sang Serilog
    builder.Host.UseSerilog();

    // 1. Đăng ký Services từ các Layer
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddApplication();

    // Cấu hình Rate Limiter đã được dời sang Nginx (Tầng Hạ tầng)

    // 2. Đăng ký Controllers và Auto-Validation (FluentValidation)
    // Cấu hình Global HttpClient với Circuit Breaker & Retry Pattern (Polly)
    builder.Services.AddHttpClient("ResilientClient")
        .SetHandlerLifetime(TimeSpan.FromMinutes(5))
        .AddPolicyHandler(HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))))
        .AddPolicyHandler(HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        });
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssembly(typeof(EduOps.Application.Interfaces.IUserService).Assembly);
    FluentValidation.ValidatorOptions.Global.DefaultRuleLevelCascadeMode = FluentValidation.CascadeMode.Stop;

    // Cấu hình CORS cho Frontend từ appsettings.json
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend",
            policyBuilder =>
            {
                policyBuilder.WithOrigins(allowedOrigins)
                       .AllowAnyHeader()
                       .AllowAnyMethod()
                       .AllowCredentials();
            });
    });

    // 3. Cấu hình Swagger kèm chức năng nhập JWT Bearer Token
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "EduOps API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement()
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    },
                    Scheme = "oauth2",
                    Name = "Bearer",
                    In = ParameterLocation.Header,
                },
                new System.Collections.Generic.List<string>()
            }
        });
    });

    // 4. Cấu hình JWT Authentication
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["Secret"]!;

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = System.TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub/notifications"))
                {
                    context.Token = accessToken;
                }
                return System.Threading.Tasks.Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var cacheService = context.HttpContext.RequestServices.GetRequiredService<EduOps.Application.Interfaces.ICacheService>();
                var jti = context.Principal?.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti);
                var userId = context.Principal?.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
                var tenantId = context.Principal?.FindFirstValue("OrganizationId");

                // Bỏ qua check Redis cho TempToken (2FA) vì nó không có jti và không thuộc loại session thông thường
                var isTempToken = context.Principal?.FindFirstValue("TempToken");
                if (isTempToken == "true")
                {
                    return;
                }

                if (string.IsNullOrEmpty(jti) || string.IsNullOrEmpty(userId))
                {
                    context.Fail("Invalid token payload.");
                    return;
                }

                var orgIdStr = string.IsNullOrEmpty(tenantId) ? "sys" : tenantId;
                var sessionKey = $"tenant:{orgIdStr}:user:{userId}:session";
                var sessionJson = await cacheService.GetAsync<string>(sessionKey);

                if (string.IsNullOrEmpty(sessionJson))
                {
                    context.Fail("Session expired or logged out.");
                    return;
                }

                using var doc = System.Text.Json.JsonDocument.Parse(sessionJson);
                if (doc.RootElement.TryGetProperty("currentAccessTokenId", out var jtiProp))
                {
                    if (jtiProp.GetString() != jti)
                    {
                        context.Fail("Token invalidated by a new login from another device.");
                    }
                }
            }
        };
    });

    // Cấu hình SignalR và Realtime Service (Nằm ở Tầng API)
    builder.Services.AddSignalR();
    builder.Services.AddScoped<EduOps.Application.Interfaces.IRealtimeNotificationService, EduOps.Api.Services.RealtimeNotificationService>();
    builder.Services.AddScoped<EduOps.Application.Interfaces.ISchoolService, EduOps.Application.Services.SchoolService>();
    builder.Services.AddScoped<EduOps.Application.Interfaces.IStudentService, EduOps.Application.Services.StudentService>();
    builder.Services.AddScoped<EduOps.Application.Interfaces.IClassScheduleService, EduOps.Application.Services.ClassScheduleService>();

    // Cấu hình Multi-tenant & HTTP Context & Caching
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddMemoryCache();
    builder.Services.AddScoped<EduOps.Application.Interfaces.ICurrentUserService, EduOps.Api.Services.CurrentUserService>();

    // Cấu hình Dynamic Permission-based Authorization
    builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
    builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

    // Cấu hình Hangfire
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(Hangfire.CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options =>
            options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))));

    builder.Services.AddHangfireServer();

    // Cấu hình Health Checks & Compression
    builder.Services.AddHealthChecks()
        .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
        .AddRedis(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379");

    builder.Services.AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
        options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
        options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
    });

    builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
    {
        options.Level = System.IO.Compression.CompressionLevel.Fastest;
    });

    // 5. Build App
    var app = builder.Build();

    // 6. Cấu hình Pipeline Middleware
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduOps API v1"));

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseMiddleware<IdempotencyMiddleware>();

    // app.UseHttpsRedirection(); // Tắt HTTPS Redirect để cho phép internal HTTP từ Docker Next.js

    app.UseResponseCompression();

    app.UseCors("AllowFrontend");



    app.UseAuthentication();
    app.UseAuthorization();
    app.UseMiddleware<LogEnrichmentMiddleware>();

    // Bật Dashboard Hangfire (Cần setup Auth cho endpoint này sau trên thực tế)
    app.UseHangfireDashboard("/hangfire");

    app.MapControllers();
    app.MapHub<EduOps.Api.Hubs.NotificationHub>("/hub/notifications");
    app.MapHealthChecks("/api/health");

    // Đăng ký Recurring Job khi App vừa chạy lên
    using (var scope = app.Services.CreateScope())
    {
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<Hangfire.IRecurringJobManager>();
        var dbContext = scope.ServiceProvider.GetRequiredService<EduOps.Infrastructure.Data.EduOpsDbContext>();

        var dailyCronDb = dbContext.SystemSettings.FirstOrDefault(s => s.SettingKey == "DAILY_REMINDER_CRON")?.SettingValue;
        var cronConfig = dailyCronDb ?? builder.Configuration["HangfireSettings:DailyReminderCron"] ?? "0 21 * * *";

        recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.NotificationJobs>(
            "Daily_Reminder_Job",
            job => job.SendDailyRemindersAsync(),
            cronConfig,
            new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
        );

        // Đăng ký Job kiểm tra gia hạn Gói cước (Chạy lúc 8:00 sáng mỗi ngày)
        var expiryCronDb = dbContext.SystemSettings.FirstOrDefault(s => s.SettingKey == "SUBSCRIPTION_EXPIRY_CRON")?.SettingValue;
        var expiryCron = expiryCronDb ?? builder.Configuration["HangfireSettings:SubscriptionExpiryCron"] ?? "0 8 * * *";
        recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.NotificationJobs>(
            "Subscription_Expiry_Job",
            job => job.CheckSubscriptionExpiryAsync(),
            expiryCron,
            new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
        );

        // Đăng ký Job hủy giao dịch treo quá 10 phút (Chạy mỗi 1 phút)
        recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.SubscriptionJobs>(
            "Cancel_Expired_Transactions_Job",
            job => job.CancelExpiredTransactionsAsync(),
            "*/1 * * * *",
            new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
        );

        // Tự động Seed Dữ liệu Test (Đã tắt cho môi trường Product)
        EduOps.Infrastructure.Data.DataSeeder.SeedAsync(scope.ServiceProvider).GetAwaiter().GetResult();
    }

    app.Run();
}
catch (Exception ex)
{
    // Bỏ qua lỗi HostAbortedException do EF Core Tools cố tình ném ra khi chạy lệnh Migration
    if (ex.GetType().Name != "HostAbortedException")
    {
        Log.Fatal(ex, "Application terminated unexpectedly");
    }
}
finally
{
    Log.CloseAndFlush();
}
