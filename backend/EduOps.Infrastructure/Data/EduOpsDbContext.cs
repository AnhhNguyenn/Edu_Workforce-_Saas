using System;
using System.Threading;
using System.Threading.Tasks;
using EduOps.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduOps.Infrastructure.Data
{
    public class EduOpsDbContext : DbContext
    {
        private readonly EduOps.Application.Interfaces.ICurrentUserService _currentUserService;

        public EduOpsDbContext(DbContextOptions<EduOpsDbContext> options, EduOps.Application.Interfaces.ICurrentUserService currentUserService) : base(options)
        {
            _currentUserService = currentUserService;
        }

        // Expose parameters for EF Core Global Query Filter Translation
        public Guid? CurrentOrgId => _currentUserService.OrganizationId;
        public bool IsSuperAdmin => _currentUserService.Role == "SUPER_ADMIN";

        // --- CORE ---
        public DbSet<User> Users { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        
        // --- ACADEMIC ---
        public DbSet<School> Schools { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<ClassSchedule> ClassSchedules { get; set; }
        public DbSet<Session> Sessions { get; set; }
        
        // --- ATTENDANCE & REPORT ---
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<StudentSessionAttendance> StudentSessionAttendances { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportMedia> ReportMedia { get; set; }
        
        // --- SYSTEM & AUDIT ---
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<FileRecord> Files { get; set; }
        public DbSet<BillingTransaction> BillingTransactions { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        
        // --- AUTH ---
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
        public DbSet<UserDevice> UserDevices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // BẮT BUỘC LỌC GLOBAL: Soft Delete & Multi-Tenant
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Soft Delete
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(ConvertFilterExpression<BaseEntity>(e => e.DeletedAt == null, entityType.ClrType));
                }

                // Multi-Tenant Isolation (Chặn tuyệt đối truy cập chéo dữ liệu)
                if (typeof(TenantEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(ConvertFilterExpression<TenantEntity>(
                            e => e.DeletedAt == null && (IsSuperAdmin || e.OrganizationId == CurrentOrgId), 
                            entityType.ClrType));
                }

                // LƯU ENUM TRONG DATABASE DƯỚI DẠNG CHUỖI (VARCHAR)
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType.IsEnum)
                    {
                        var type = typeof(Microsoft.EntityFrameworkCore.Storage.ValueConversion.EnumToStringConverter<>).MakeGenericType(property.ClrType);
                        var converter = Activator.CreateInstance(type, new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ConverterMappingHints()) as Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter;
                        property.SetValueConverter(converter);
                    }
                }
            }

            // ĐÁNH INDEX (TỐI ƯU HIỆU NĂNG TÌM KIẾM TỐC ĐỘ CAO)
            modelBuilder.Entity<User>().HasIndex(u => u.Email);
            modelBuilder.Entity<User>().HasIndex(u => u.OrganizationId);
            modelBuilder.Entity<Organization>().HasIndex(o => o.Code).IsUnique();
            modelBuilder.Entity<School>().HasIndex(s => s.OrganizationId);
            modelBuilder.Entity<Class>().HasIndex(c => c.SchoolId);
            modelBuilder.Entity<Session>().HasIndex(s => new { s.SessionDate, s.TeacherId });
            modelBuilder.Entity<Attendance>().HasIndex(a => a.SessionId);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        if (entry.Entity is TenantEntity tenantEntity && tenantEntity.OrganizationId == null)
                        {
                            tenantEntity.OrganizationId = _currentUserService.OrganizationId;
                        }
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entry.Entity.DeletedAt = DateTime.UtcNow;
                        break;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }

        private static System.Linq.Expressions.LambdaExpression ConvertFilterExpression<TInterface>(
            System.Linq.Expressions.Expression<Func<TInterface, bool>> filterExpression, Type entityType)
        {
            var newParam = System.Linq.Expressions.Expression.Parameter(entityType);
            var newBody = Microsoft.EntityFrameworkCore.Query.ReplacingExpressionVisitor.Replace(filterExpression.Parameters.Single(), newParam, filterExpression.Body);
            return System.Linq.Expressions.Expression.Lambda(newBody, newParam);
        }
    }
}
