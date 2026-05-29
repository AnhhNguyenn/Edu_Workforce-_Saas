using EduOps.Application.Interfaces;
using EduOps.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EduOps.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Đăng ký các Business Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IProfileService, ProfileService>();
            
            // Core Academic
            services.AddScoped<IOrganizationService, OrganizationService>();
            services.AddScoped<ISchoolService, SchoolService>();
            services.AddScoped<IClassService, ClassService>();
            services.AddScoped<ISessionService, SessionService>();
            services.AddScoped<IAttendanceService, AttendanceService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            
            // Notifications & Background Jobs
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<EduOps.Application.BackgroundJobs.NotificationJobs>();

            // Mapping: Khuyến nghị dùng Manual Mapping bằng Extension Methods thay vì AutoMapper
            // để đảm bảo Performance và giảm Dependency theo chuẩn Clean Architecture.

            return services;
        }
    }
}
