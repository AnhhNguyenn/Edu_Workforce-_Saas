using System.Text;
using EduOps.Api.Middleware;
using EduOps.Application;
using EduOps.Infrastructure;
using Hangfire;
using Hangfire.PostgreSql;
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
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

// Load Configuration thủ công trước khi Builder chạy để cấp cho Serilog
var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";
var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env}.json", optional: true)
    .Build();

// Định dạng Log chuẩn Doanh nghiệp (Enterprise Standard)
var outputTemplate = "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff}] [{Level:u3}] [{SourceContext}] {Message:lj}{NewLine}{Exception}";

long fileSizeLimit = configuration.GetValue<long>("SerilogSettings:FileSizeLimitBytes", 10485760);
int retainedFileCount = configuration.GetValue<int>("SerilogSettings:RetainedFileCountLimit", 30);

// Cấu hình Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: outputTemplate)
    .WriteTo.File("Logs/eduops-log-.txt",
                  rollingInterval: RollingInterval.Day,
                  outputTemplate: outputTemplate,
                  fileSizeLimitBytes: fileSizeLimit,
                  retainedFileCountLimit: retainedFileCount)
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

    // Đăng ký Rate Limiter (Chống DDoS/Brute-force)
    builder.Services.AddRateLimiter(options =>
    {
        options.GlobalLimiter = PartitionedRateLimiter.Create<Microsoft.AspNetCore.Http.HttpContext, string>(httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 100,
                    QueueLimit = 0,
                    Window = TimeSpan.FromMinutes(1)
                }));

        // Rate Limiter riêng cho Auth (Chống Brute-force mật khẩu)
        options.AddPolicy("AuthLimit", httpContext =>
            RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
                factory: partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 5,
                    QueueLimit = 0,
                    Window = TimeSpan.FromMinutes(1)
                }));

        options.RejectionStatusCode = 429;
    });

    // 2. Đăng ký Controllers và Auto-Validation (FluentValidation)
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

    // Cấu hình Hangfire
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(Hangfire.CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options =>
            options.UseNpgsqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))));

    builder.Services.AddHangfireServer();

    // 5. Build App
    var app = builder.Build();

    // 6. Cấu hình Pipeline Middleware
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduOps API v1"));

    app.UseMiddleware<ExceptionHandlingMiddleware>();

    app.UseHttpsRedirection();

    app.UseCors("AllowFrontend");

    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();

    // Bật Dashboard Hangfire (Cần setup Auth cho endpoint này sau trên thực tế)
    app.UseHangfireDashboard("/hangfire");

    app.MapControllers();
    app.MapHub<EduOps.Api.Hubs.NotificationHub>("/hub/notifications");

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

        // Tự động Seed Dữ liệu Test
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
