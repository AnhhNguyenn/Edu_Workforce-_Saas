using System;
using System.Text.Json;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace EduOps.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IMemoryCache _memoryCache;

        public RedisCacheService(IDistributedCache distributedCache, IMemoryCache memoryCache)
        {
            _distributedCache = distributedCache;
            _memoryCache = memoryCache;
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var cachedData = await _distributedCache.GetStringAsync(key);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    return JsonSerializer.Deserialize<T>(cachedData);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Failed to GET key '{key}'. Error: {ex.Message}");
            }

            // Fallback: Nếu Redis sập hoặc key chỉ tồn tại trong RAM do lúc Set Redis bị sập
            if (_memoryCache.TryGetValue(key, out T? memoryValue))
            {
                return memoryValue;
            }

            return default;
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null)
        {
            bool redisFailed = false;
            try
            {
                var options = new DistributedCacheEntryOptions();
                if (absoluteExpireTime.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = absoluteExpireTime;
                }

                var serializedData = JsonSerializer.Serialize(value);
                await _distributedCache.SetStringAsync(key, serializedData, options);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Failed to SET key '{key}'. Error: {ex.Message}");
                redisFailed = true;
            }

            if (redisFailed)
            {
                var memoryOptions = new MemoryCacheEntryOptions();
                if (absoluteExpireTime.HasValue)
                {
                    memoryOptions.AbsoluteExpirationRelativeToNow = absoluteExpireTime;
                }
                _memoryCache.Set(key, value, memoryOptions);
            }
            else
            {
                // Xóa RAM để tránh rác nếu Redis sống lại
                _memoryCache.Remove(key);
            }
        }

        public async Task RemoveAsync(string key)
        {
            _memoryCache.Remove(key);
            try
            {
                await _distributedCache.RemoveAsync(key);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Failed to REMOVE key '{key}': {ex.Message}");
            }
        }
    }
}
