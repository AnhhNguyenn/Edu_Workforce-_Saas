using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace EduOps.Domain.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id, bool asNoTracking = false);
        Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = false);
        IQueryable<T> GetQueryable();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false, bool asNoTracking = false, string includeProperties = "");
        Task<(IEnumerable<T> Items, int TotalCount)> FindPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, bool asNoTracking = false, string includeProperties = "");
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false, bool asNoTracking = false, string includeProperties = "");
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void Update(T entity);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
        void Detach(T entity);
    }
}
