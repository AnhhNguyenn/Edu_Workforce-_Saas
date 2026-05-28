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

var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Services từ các Layer
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// 2. Cấu hình Controllers
builder.Services.AddControllers();

// Cấu hình CORS cho Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000", "http://localhost:3001")
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
        Description = "JWT Authorization header. Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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

// Cấu hình Hangfire
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(Hangfire.CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfireServer();

// 5. Build App
var app = builder.Build();

// 6. Cấu hình Pipeline Middleware
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EduOps API v1"));

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

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
    // Chạy mỗi ngày lúc 21:00 (Cron expression: 0 21 * * *)
    recurringJobManager.AddOrUpdate<EduOps.Application.BackgroundJobs.NotificationJobs>(
        "Daily_Reminder_Job",
        job => job.SendDailyRemindersAsync(),
        "0 21 * * *",
        new Hangfire.RecurringJobOptions { TimeZone = System.TimeZoneInfo.Local }
    );
}

app.Run();
