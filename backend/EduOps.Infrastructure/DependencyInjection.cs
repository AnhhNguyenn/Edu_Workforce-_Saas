using EduOps.Application.Interfaces;
using EduOps.Domain.Interfaces;
using EduOps.Infrastructure.Data;
using EduOps.Infrastructure.Logging;
using EduOps.Infrastructure.Notifications;
using EduOps.Infrastructure.Repositories;
using EduOps.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EduOps.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Database
            services.AddDbContext<EduOpsDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            // Repositories & UnitOfWork
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Logging
            services.AddSingleton<ICustomLogger, CustomLogger<object>>();

            // Email & Notifications
            services.AddTransient<IEmailService, MockEmailService>();

            // Redis Distributed Cache
            var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "EduOps_";
            });
            services.AddScoped<ICacheService, EduOps.Infrastructure.Services.RedisCacheService>();

            // Cloudflare R2 (S3 API)
            services.AddScoped<IStorageService>(provider =>
                new CloudflareR2Service(
                    configuration["CloudflareR2:AccessKey"]!,
                    configuration["CloudflareR2:SecretKey"]!,
                    configuration["CloudflareR2:AccountId"]!,
                    configuration["CloudflareR2:BucketName"]!,
                    configuration["CloudflareR2:PublicDomain"]!
                ));

            return services;
        }
    }
}
