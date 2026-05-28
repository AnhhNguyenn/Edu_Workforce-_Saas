using System;
using System.Threading;
using System.Threading.Tasks;

namespace EduOps.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;
        Task<int> CommitAsync(CancellationToken cancellationToken = default);
        Task RollbackAsync();
    }
}
