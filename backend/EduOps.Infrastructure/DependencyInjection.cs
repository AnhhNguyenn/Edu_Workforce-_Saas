using EduOps.Application.Interfaces;
using EduOps.Infrastructure.Data;
using EduOps.Infrastructure.Logging;
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
            services.AddSingleton(typeof(ICustomLogger<>), typeof(CustomLogger<>));
            // Chú ý: Dùng ICustomLogger thay vì ICustomLogger<> cho các class không Generic nếu cần, 
            // hoặc chuyển Interface ICustomLogger thành non-generic và inject qua Factory. 
            // Tạm thời đăng ký map cho ICustomLogger chung:
            services.AddSingleton<ICustomLogger, CustomLogger<object>>();

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
