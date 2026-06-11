using System;
using System.Text.Json;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace EduOps.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;

        public RedisCacheService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cachedData = await _cache.GetStringAsync(key);
                if (string.IsNullOrEmpty(cachedData))
                {
                    return default;
                }

                return JsonSerializer.Deserialize<T>(cachedData);
            }
            catch (Exception ex)
            {
                // Fallback to DB gracefully if Redis is down
                Console.WriteLine($"[Redis Error] Failed to GET key '{key}': {ex.Message}");
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null)
        {
            try
            {
                var options = new DistributedCacheEntryOptions();
                if (absoluteExpireTime.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = absoluteExpireTime;
                }

                var serializedData = JsonSerializer.Serialize(value);
                await _cache.SetStringAsync(key, serializedData, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Failed to SET key '{key}': {ex.Message}");
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                await _cache.RemoveAsync(key);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Failed to REMOVE key '{key}': {ex.Message}");
            }
        }
    }
}
