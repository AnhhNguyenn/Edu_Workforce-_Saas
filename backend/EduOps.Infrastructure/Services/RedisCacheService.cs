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
            var cachedData = await _cache.GetStringAsync(key);
            if (string.IsNullOrEmpty(cachedData))
            {
                return default;
            }

            return JsonSerializer.Deserialize<T>(cachedData);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null)
        {
            var options = new DistributedCacheEntryOptions();
            if (absoluteExpireTime.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = absoluteExpireTime;
            }

            var serializedData = JsonSerializer.Serialize(value);
            await _cache.SetStringAsync(key, serializedData, options);
        }

        public async Task RemoveAsync(string key)
        {
            await _cache.RemoveAsync(key);
        }
    }
}
