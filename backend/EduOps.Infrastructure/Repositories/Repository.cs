using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using EduOps.Domain.Interfaces;
using EduOps.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduOps.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly EduOpsDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(EduOpsDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public async Task<T?> GetByIdAsync(Guid id, bool asNoTracking = false)
        {
            if (!asNoTracking)
                return await _dbSet.FindAsync(id);
                
            var entity = await _dbSet.FindAsync(id);
            if (entity != null)
                _context.Entry(entity).State = EntityState.Detached;
            return entity;
        }

        public async Task<IEnumerable<T>> GetAllAsync(bool asNoTracking = false)
        {
            return asNoTracking ? await _dbSet.AsNoTracking().ToListAsync() : await _dbSet.ToListAsync();
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false, bool asNoTracking = false)
        {
            IQueryable<T> query = _dbSet;
            if (ignoreQueryFilters) query = query.IgnoreQueryFilters();
            if (asNoTracking) query = query.AsNoTracking();
            return await query.Where(predicate).ToListAsync();
        }

        public async Task<(IEnumerable<T> Items, int TotalCount)> FindPagedAsync(Expression<Func<T, bool>> predicate, int pageNumber, int pageSize, bool asNoTracking = false)
        {
            IQueryable<T> query = _dbSet.Where(predicate);
            if (asNoTracking) query = query.AsNoTracking();
            
            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
            return (items, totalCount);
        }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false)
        {
            IQueryable<T> query = _dbSet;
            if (ignoreQueryFilters) query = query.IgnoreQueryFilters();
            return await query.AnyAsync(predicate);
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, bool ignoreQueryFilters = false, bool asNoTracking = false)
        {
            IQueryable<T> query = _dbSet;
            if (ignoreQueryFilters) query = query.IgnoreQueryFilters();
            if (asNoTracking) query = query.AsNoTracking();
            return await query.FirstOrDefaultAsync(predicate);
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.CountAsync(predicate);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public void Update(T entity)
        {
            _dbSet.Update(entity);
        }

        public void Remove(T entity)
        {
            _dbSet.Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }
    }
}
