using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EduOps.Domain.Interfaces;
using EduOps.Infrastructure.Data;

namespace EduOps.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly EduOpsDbContext _context;
        private readonly Dictionary<Type, object> _repositories;
        private bool _disposed;

        public UnitOfWork(EduOpsDbContext context)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
        }

        public IRepository<TEntity> Repository<TEntity>() where TEntity : class
        {
            var type = typeof(TEntity);

            if (!_repositories.ContainsKey(type))
            {
                var repositoryType = typeof(Repository<>);
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(TEntity)), _context);
                if (repositoryInstance != null)
                {
                    _repositories.Add(type, repositoryInstance);
                }
            }

            return (IRepository<TEntity>)_repositories[type];
        }

        public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public Task RollbackAsync()
        {
            _context.ChangeTracker.Entries().ToList().ForEach(x => x.Reload());
            return Task.CompletedTask;
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            _disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
