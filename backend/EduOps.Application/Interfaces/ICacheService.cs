using System;
using System.Threading.Tasks;

namespace EduOps.Application.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null);
        Task RemoveAsync(string key);
        
        // --- Distributed Lock ---
        Task<bool> AcquireLockAsync(string key, TimeSpan expiration);
        Task ReleaseLockAsync(string key);
    }
}
