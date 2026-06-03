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
        public bool IsSuperAdmin => _currentUserService.Role == "SUPER_ADMIN" || _currentUserService.IsBackgroundJob;

        // --- CORE ---
        public DbSet<User> Users { get; set; }
        public DbSet<UserDetail> UserDetails { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationDetail> OrganizationDetails { get; set; }

        // --- ACADEMIC ---
        public DbSet<School> Schools { get; set; }
        public DbSet<Class> Classes { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<StudentDetail> StudentDetails { get; set; }
        public DbSet<ClassEnrollment> ClassEnrollments { get; set; }
        public DbSet<ClassSchedule> ClassSchedules { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<SessionDetail> SessionDetails { get; set; }

        // --- ATTENDANCE & REPORT ---
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<StudentSessionAttendance> StudentSessionAttendances { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportDetail> ReportDetails { get; set; }
        public DbSet<ReportMedia> ReportMedia { get; set; }
        public DbSet<ClassDetail> ClassDetails { get; set; }
        public DbSet<SchoolDetail> SchoolDetails { get; set; }
        public DbSet<SubscriptionPlanDetail> SubscriptionPlanDetails { get; set; }

        // --- SYSTEM & AUDIT ---
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<FileRecord> Files { get; set; }
        public DbSet<BillingTransaction> BillingTransactions { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<Promotion> Promotions { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }

        // --- LOOKUPS & STATUSES ---
        public DbSet<AccountStatus> AccountStatuses { get; set; }
        public DbSet<AttendanceStatus> AttendanceStatuses { get; set; }
        public DbSet<SessionStatus> SessionStatuses { get; set; }
        public DbSet<ReportStatus> ReportStatuses { get; set; }
        public DbSet<BillingStatus> BillingStatuses { get; set; }
        public DbSet<PromotionType> PromotionTypes { get; set; }
        public DbSet<NotificationType> NotificationTypes { get; set; }
        public DbSet<Gender> Genders { get; set; }
        public DbSet<EnrollmentStatus> EnrollmentStatuses { get; set; }

        // --- RBAC ---
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }

        // --- ACADEMIC MASTERS ---
        public DbSet<Grade> Grades { get; set; }
        public DbSet<Subject> Subjects { get; set; }

        // --- AUTH ---
        // Token logic is implemented directly on the User entity.

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // BẮT BUỘC LỌC GLOBAL: Soft Delete & Multi-Tenant
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Cấu hình Optimistic Concurrency Token (PostgreSQL xmin)
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).UseXminAsConcurrencyToken();
                }

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

            // --- MASTER-DETAIL 1:1 CONFIGURE ---
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserDetail)
                .WithOne(ud => ud.User)
                .HasForeignKey<UserDetail>(ud => ud.UserId);

            modelBuilder.Entity<Organization>()
                .HasOne(o => o.OrganizationDetail)
                .WithOne(od => od.Organization)
                .HasForeignKey<OrganizationDetail>(od => od.OrganizationId);

            modelBuilder.Entity<Student>()
                .HasOne(s => s.StudentDetail)
                .WithOne(sd => sd.Student)
                .HasForeignKey<StudentDetail>(sd => sd.StudentId);

            modelBuilder.Entity<Session>()
                .HasOne(s => s.SessionDetail)
                .WithOne(sd => sd.Session)
                .HasForeignKey<SessionDetail>(sd => sd.SessionId);

            modelBuilder.Entity<Report>()
                .HasOne(r => r.ReportDetail)
                .WithOne(rd => rd.Report)
                .HasForeignKey<ReportDetail>(rd => rd.ReportId);

            modelBuilder.Entity<Class>()
                .HasOne(c => c.ClassDetail)
                .WithOne(cd => cd.Class)
                .HasForeignKey<ClassDetail>(cd => cd.ClassId);

            modelBuilder.Entity<School>()
                .HasOne(s => s.SchoolDetail)
                .WithOne(sd => sd.School)
                .HasForeignKey<SchoolDetail>(sd => sd.SchoolId);

            modelBuilder.Entity<SubscriptionPlan>()
                .HasOne(p => p.SubscriptionPlanDetail)
                .WithOne(pd => pd.SubscriptionPlan)
                .HasForeignKey<SubscriptionPlanDetail>(pd => pd.SubscriptionPlanId);

            // ĐÁNH INDEX (TỐI ƯU HIỆU NĂNG TÌM KIẾM TỐC ĐỘ CAO)
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.OrganizationId);
            modelBuilder.Entity<Organization>().HasIndex(o => o.Code).IsUnique();
            modelBuilder.Entity<OrganizationDetail>().HasIndex(o => o.Email).IsUnique();
            modelBuilder.Entity<BillingTransaction>().HasIndex(t => t.ReferenceCode);
            modelBuilder.Entity<School>().HasIndex(s => s.OrganizationId);
            modelBuilder.Entity<Class>().HasIndex(c => c.SchoolId);
            modelBuilder.Entity<Session>().HasIndex(s => new { s.SessionDate, s.TeacherId });
            modelBuilder.Entity<Attendance>().HasIndex(a => a.SessionId);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            OnBeforeSaveChanges();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void OnBeforeSaveChanges()
        {
            var userId = _currentUserService.UserId;
            
            // Lọc ra các entry có thay đổi (bỏ qua AuditLog để tránh lặp vô tận)
            var entries = ChangeTracker.Entries().Where(e => 
                e.Entity is not AuditLog && 
                (e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)).ToList();

            foreach (var entry in entries)
            {
                // 1. Soft Delete & Base Fields Handling
                if (entry.Entity is BaseEntity baseEntity)
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            baseEntity.CreatedAt = DateTime.UtcNow;
                            if (baseEntity is TenantEntity tenantEntity && tenantEntity.OrganizationId == null)
                            {
                                tenantEntity.OrganizationId = _currentUserService.OrganizationId;
                            }
                            break;
                        case EntityState.Modified:
                            baseEntity.UpdatedAt = DateTime.UtcNow;
                            break;
                        case EntityState.Deleted:
                            entry.State = EntityState.Modified;
                            baseEntity.DeletedAt = DateTime.UtcNow;
                            break;
                    }
                }

                // 2. Tự động ghi Audit Log
                if (userId != Guid.Empty && entry.Entity is BaseEntity entityWithId)
                {
                    var action = entry.State == EntityState.Added ? "CREATE" : (entityWithId.DeletedAt != null ? "DELETE" : "UPDATE");

                    var auditLog = new AuditLog
                    {
                        UserId = userId,
                        OrganizationId = (entry.Entity as TenantEntity)?.OrganizationId,
                        EntityType = entry.Entity.GetType().Name,
                        EntityId = entityWithId.Id,
                        Action = action,
                        IpAddress = _currentUserService.IpAddress,
                        UserAgent = _currentUserService.UserAgent,
                        CreatedAt = DateTime.UtcNow
                    };

                    if (action == "UPDATE" || action == "DELETE")
                    {
                        var originalValues = new System.Collections.Generic.Dictionary<string, object?>();
                        foreach (var prop in entry.OriginalValues.Properties)
                        {
                            originalValues[prop.Name] = entry.OriginalValues[prop];
                        }
                        auditLog.OldData = System.Text.Json.JsonSerializer.Serialize(originalValues);
                    }

                    if (action == "CREATE" || action == "UPDATE")
                    {
                        var currentValues = new System.Collections.Generic.Dictionary<string, object?>();
                        foreach (var prop in entry.CurrentValues.Properties)
                        {
                            currentValues[prop.Name] = entry.CurrentValues[prop];
                        }
                        auditLog.NewData = System.Text.Json.JsonSerializer.Serialize(currentValues);
                    }

                    AuditLogs.Add(auditLog);
                }
            }
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
