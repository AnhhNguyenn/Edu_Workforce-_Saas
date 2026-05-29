using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Domain.Entities;
using EduOps.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduOps.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<EduOpsDbContext>();

            // Tự động Apply Migrations nếu chưa
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }

            // 1. Seed Super Admin
            if (!context.Users.IgnoreQueryFilters().Any(u => u.Email == "superadmin@test.com"))
            {
                context.Users.Add(new User
                {
                    FullName = "Super Admin (Hệ thống)",
                    Email = "superadmin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "SUPER_ADMIN",
                    Status = "ACTIVE"
                });
            }

            // 2. Seed Organization
            Organization? org = await context.Organizations.IgnoreQueryFilters().FirstOrDefaultAsync(o => o.Code == "TESTORG");
            if (org == null)
            {
                org = new Organization
                {
                    Name = "Trung tâm Test (Tự động tạo)",
                    Code = "TESTORG",
                    Email = "center@test.com",
                    Phone = "0987654321",
                    MaxUsers = 100,
                    CurrentUsers = 2,
                    Status = AccountStatus.ACTIVE,
                    SubscriptionStatus = "ACTIVE",
                    SubscriptionStart = DateTime.UtcNow,
                    SubscriptionEnd = DateTime.UtcNow.AddMonths(1)
                };
                context.Organizations.Add(org);
                await context.SaveChangesAsync(); // Lưu để lấy ID cho User
            }

            // 3. Seed Center Admin
            if (!context.Users.IgnoreQueryFilters().Any(u => u.Email == "centeradmin@test.com"))
            {
                context.Users.Add(new User
                {
                    OrganizationId = org.Id,
                    FullName = "Quản lý Trung tâm",
                    Email = "centeradmin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "CENTER_ADMIN",
                    Status = "ACTIVE"
                });
            }

            // 4. Seed Teacher
            if (!context.Users.IgnoreQueryFilters().Any(u => u.Email == "teacher@test.com"))
            {
                context.Users.Add(new User
                {
                    OrganizationId = org.Id,
                    FullName = "Giáo viên Test",
                    Email = "teacher@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "TEACHER",
                    Status = "ACTIVE"
                });
            }
            
            // 5. Seed Assistant
            if (!context.Users.IgnoreQueryFilters().Any(u => u.Email == "assistant@test.com"))
            {
                context.Users.Add(new User
                {
                    OrganizationId = org.Id,
                    FullName = "Trợ giảng Test",
                    Email = "assistant@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "ASSISTANT",
                    Status = "ACTIVE"
                });
            }

            // 6. Seed Gói cước (Để test mua bán)
            if (!context.Set<SubscriptionPlan>().IgnoreQueryFilters().Any(p => p.Name == "Gói Pro"))
            {
                context.Set<SubscriptionPlan>().Add(new SubscriptionPlan
                {
                    Name = "Gói Pro",
                    Description = "Gói cao cấp cho trung tâm - Tất cả tính năng",
                    PricePerMonth = 500000,
                    PricePerYear = 5000000,
                    MaxUsers = 100,
                    Status = AccountStatus.ACTIVE
                });
            }

            await context.SaveChangesAsync();
        }
    }
}
