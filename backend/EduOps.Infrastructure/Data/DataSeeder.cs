using System;
using System.Linq;
using System.Threading.Tasks;
using EduOps.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EduOps.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<EduOpsDbContext>();

            // Tự động Apply Migrations nếu chưa có
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }

            // 1. Seed Master Data (Lookups & RBAC)
            await SeedMasterData(context);

            var activeStatus = await context.AccountStatuses.FirstOrDefaultAsync(x => x.Code == "ACTIVE");
            var superAdminRole = await context.Roles.FirstOrDefaultAsync(x => x.Code == "SUPER_ADMIN");
            var centerAdminRole = await context.Roles.FirstOrDefaultAsync(x => x.Code == "CENTER_ADMIN");
            var teacherRole = await context.Roles.FirstOrDefaultAsync(x => x.Code == "TEACHER");
            var assistantRole = await context.Roles.FirstOrDefaultAsync(x => x.Code == "ASSISTANT");

            // 2. Seed Super Admin
            var superAdmin = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == "superadmin@test.com");
            if (superAdmin == null)
            {
                context.Users.Add(new User
                {
                    FullName = "Super Admin (Hệ thống)",
                    Email = "superadmin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    RoleId = superAdminRole?.Id,
                    StatusId = activeStatus?.Id,
                    UserDetail = new UserDetail()
                });
            }
            else
            {
                // Tự động Vá lỗi (Auto-Heal) nếu người dùng bị mất RoleId hoặc RoleId trỏ tới Role rác đã bị xóa
                var currentRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == superAdmin.RoleId);
                if ((superAdmin.RoleId == null || currentRole == null || currentRole.Code != "SUPER_ADMIN") && superAdminRole != null)
                {
                    superAdmin.RoleId = superAdminRole.Id;
                    superAdmin.StatusId = activeStatus?.Id;
                    context.Users.Update(superAdmin);
                }
            }



            // 8. Seed System Settings (Feature Toggles)
            if (!context.SystemSettings.IgnoreQueryFilters().Any())
            {
                // Note: ValueType as Enum was removed, assuming it's still there or we just use strings.
                // Assuming ValueType enum was NOT asked to be removed (User said entities, ValueType is just for Setting)
                // Wait, I did not remove SettingValueType from SystemSetting.cs.
                // Let me check if SettingValueType is still there. 
                // Wait, I'll just keep the original seeding for SystemSettings.
                context.SystemSettings.AddRange(
                    new SystemSetting { SettingKey = "ENABLE_ATTENDANCE", SettingValue = "true", Description = "Bật/Tắt tính năng Điểm danh trên toàn hệ thống", IsPublic = true },
                    new SystemSetting { SettingKey = "ENABLE_FINANCE", SettingValue = "true", Description = "Bật/Tắt Module Thu ngân & Thanh toán", IsPublic = true },
                    new SystemSetting { SettingKey = "ENABLE_REPORTING", SettingValue = "true", Description = "Bật/Tắt tính năng Nộp Báo cáo", IsPublic = true },
                    new SystemSetting { SettingKey = "PAYMENT_BANK_ACCOUNT", SettingValue = "96247UH35V", Description = "Số tài khoản nhận tiền thanh toán gói cước", IsPublic = true },
                    new SystemSetting { SettingKey = "PAYMENT_BANK_NAME", SettingValue = "BIDV", Description = "Tên ngân hàng nhận tiền", IsPublic = true },
                    new SystemSetting { SettingKey = "DAILY_REMINDER_CRON", SettingValue = "0 21 * * *", Description = "Lịch chạy Job thông báo (Cron Expression)", IsPublic = false },
                    new SystemSetting { SettingKey = "SUBSCRIPTION_EXPIRY_CRON", SettingValue = "0 8 * * *", Description = "Lịch chạy Job kiểm tra gói hạn (Cron Expression)", IsPublic = false },
                    new SystemSetting { SettingKey = "DEFAULT_TRIAL_DAYS", SettingValue = "14", Description = "Số ngày dùng thử mặc định cho Trung tâm mới", IsPublic = false },
                    new SystemSetting { SettingKey = "ENABLE_TRIAL", SettingValue = "true", Description = "Bật/Tắt chế độ dùng thử cho Trung tâm mới", IsPublic = true },
                    new SystemSetting { SettingKey = "DEFAULT_TRIAL_MAX_USERS", SettingValue = "5", Description = "Số lượng giáo viên/nhân sự tối đa trong gói dùng thử", IsPublic = true }
                );
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedMasterData(EduOpsDbContext context)
        {
            // Permissions
            var permissions = new[]
            {
                new Permission { Module = "Users", Action = "CREATE", Description = "Tạo người dùng mới" },
                new Permission { Module = "Users", Action = "READ", Description = "Xem danh sách người dùng" },
                new Permission { Module = "Users", Action = "UPDATE", Description = "Cập nhật người dùng" },
                new Permission { Module = "Users", Action = "DELETE", Description = "Xóa người dùng" },

                new Permission { Module = "Roles", Action = "CREATE", Description = "Tạo chức vụ mới" },
                new Permission { Module = "Roles", Action = "READ", Description = "Xem danh sách chức vụ" },
                new Permission { Module = "Roles", Action = "UPDATE", Description = "Cập nhật chức vụ" },
                new Permission { Module = "Roles", Action = "DELETE", Description = "Xóa chức vụ" },

                new Permission { Module = "Students", Action = "CREATE", Description = "Tạo học viên mới" },
                new Permission { Module = "Students", Action = "READ", Description = "Xem danh sách học viên" },
                new Permission { Module = "Students", Action = "UPDATE", Description = "Cập nhật học viên" },
                new Permission { Module = "Students", Action = "DELETE", Description = "Xóa học viên" },

                new Permission { Module = "Classes", Action = "CREATE", Description = "Tạo lớp học mới" },
                new Permission { Module = "Classes", Action = "READ", Description = "Xem danh sách lớp học" },
                new Permission { Module = "Classes", Action = "UPDATE", Description = "Cập nhật lớp học" },
                new Permission { Module = "Classes", Action = "DELETE", Description = "Xóa lớp học" },

                new Permission { Module = "Finance", Action = "READ", Description = "Xem báo cáo tài chính" },
                new Permission { Module = "System", Action = "MANAGE_SETTINGS", Description = "Quản lý cài đặt hệ thống" }
            };

            foreach (var p in permissions)
            {
                if (!context.Permissions.IgnoreQueryFilters().Any(x => x.Module == p.Module && x.Action == p.Action))
                {
                    context.Permissions.Add(p);
                }
            }
            await context.SaveChangesAsync();

            // Roles
            var roles = new[] { "SUPER_ADMIN", "CENTER_ADMIN", "TEACHER", "ASSISTANT" };
            foreach (var r in roles)
            {
                if (!context.Roles.IgnoreQueryFilters().Any(x => x.Code == r))
                    context.Roles.Add(new Role { Code = r, Name = r });
            }
            await context.SaveChangesAsync();

            // Gán toàn bộ quyền cho SUPER_ADMIN
            var superAdminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Code == "SUPER_ADMIN");
            if (superAdminRole != null)
            {
                var allPerms = await context.Permissions.IgnoreQueryFilters().ToListAsync();
                foreach (var p in allPerms)
                {
                    if (!context.RolePermissions.IgnoreQueryFilters().Any(rp => rp.RoleId == superAdminRole.Id && rp.PermissionId == p.Id))
                    {
                        context.RolePermissions.Add(new RolePermission { RoleId = superAdminRole.Id, PermissionId = p.Id });
                    }
                }
            }

            // Account Statuses
            var accStatuses = new[] { "ACTIVE", "INACTIVE", "SUSPENDED", "DROPPED_OUT" };
            foreach (var s in accStatuses)
            {
                if (!context.AccountStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.AccountStatuses.Add(new AccountStatus { Code = s, Name = s });
            }

            // Attendance Statuses
            var attStatuses = new[] { "ON_TIME", "LATE", "ABSENT", "EARLY_CHECKOUT" };
            foreach (var s in attStatuses)
            {
                if (!context.AttendanceStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.AttendanceStatuses.Add(new AttendanceStatus { Code = s, Name = s });
            }

            // Session Statuses
            var sessStatuses = new[] { "SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED" };
            foreach (var s in sessStatuses)
            {
                if (!context.SessionStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.SessionStatuses.Add(new SessionStatus { Code = s, Name = s });
            }

            // Report Statuses
            var repStatuses = new[] { "DRAFT", "SUBMITTED", "FINALIZED" };
            foreach (var s in repStatuses)
            {
                if (!context.ReportStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.ReportStatuses.Add(new ReportStatus { Code = s, Name = s });
            }

            // Billing Statuses
            var billStatuses = new[] { "SUCCESS", "FAILED", "PENDING" };
            foreach (var s in billStatuses)
            {
                if (!context.BillingStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.BillingStatuses.Add(new BillingStatus { Code = s, Name = s });
            }

            // Promotion Types
            var promoTypes = new[] { "PROMO_CODE", "AUTO_DISCOUNT" };
            foreach (var s in promoTypes)
            {
                if (!context.PromotionTypes.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.PromotionTypes.Add(new PromotionType { Code = s, Name = s });
            }

            // Notification Types
            var notifTypes = new[] { "CLASS_REMINDER", "LATE_ALERT", "MISSING_REPORT", "SESSION_CHANGED", "CHECKOUT_ALERT" };
            foreach (var s in notifTypes)
            {
                if (!context.NotificationTypes.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.NotificationTypes.Add(new NotificationType { Code = s, Name = s });
            }

            // Genders
            var genders = new[] { "MALE", "FEMALE", "OTHER" };
            foreach (var s in genders)
            {
                if (!context.Genders.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.Genders.Add(new Gender { Code = s, Name = s });
            }

            // Enrollment Statuses
            var enrollStatuses = new[] { "ENROLLED", "DROPPED_OUT", "COMPLETED" };
            foreach (var s in enrollStatuses)
            {
                if (!context.EnrollmentStatuses.IgnoreQueryFilters().Any(x => x.Code == s))
                    context.EnrollmentStatuses.Add(new EnrollmentStatus { Code = s, Name = s });
            }

            await context.SaveChangesAsync();
        }
    }
}
