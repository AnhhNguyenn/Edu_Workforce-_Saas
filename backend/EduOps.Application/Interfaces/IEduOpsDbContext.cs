using Microsoft.EntityFrameworkCore;
using EduOps.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface IEduOpsDbContext
    {
        DbSet<User> Users { get; }
        DbSet<Role> Roles { get; }
        DbSet<Organization> Organizations { get; }
        DbSet<SubscriptionPlan> SubscriptionPlans { get; }
        DbSet<SystemSetting> SystemSettings { get; }
        DbSet<Notification> Notifications { get; }
        DbSet<SystemBroadcast> SystemBroadcasts { get; }
        
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
