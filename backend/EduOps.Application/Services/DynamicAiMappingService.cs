using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using EduOps.Domain.Interfaces;
using EduOps.Domain.Entities;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EduOps.Application.Services
{
    public class DynamicAiMappingService : IAiMappingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DynamicAiMappingService> _logger;
        private readonly ISystemSettingService _systemSettingService;
        private readonly IServiceScopeFactory _scopeFactory;

        public DynamicAiMappingService(HttpClient httpClient, IConfiguration configuration, ILogger<DynamicAiMappingService> logger, ISystemSettingService systemSettingService, IServiceScopeFactory scopeFactory)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _systemSettingService = systemSettingService;
            _scopeFactory = scopeFactory;
        }

        private async Task<decimal> GetPriceAsync(string key, decimal defaultValue)
        {
            var valStr = await _systemSettingService.GetSettingValueAsync(key);
            if (decimal.TryParse(valStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var val))
            {
                return val;
            }
            return defaultValue;
        }

        public async Task<Dictionary<string, string>> MapExcelHeadersAsync(List<string> headers)
        {
            var dbApiKey = await _systemSettingService.GetSettingValueAsync("AI_API_KEY");
            var dbBaseUrl = await _systemSettingService.GetSettingValueAsync("AI_BASE_URL");
            var dbModel = await _systemSettingService.GetSettingValueAsync("AI_MODEL");

            var apiKey = !string.IsNullOrEmpty(dbApiKey) ? dbApiKey : _configuration["AiSettings:ApiKey"];
            var baseUrl = !string.IsNullOrEmpty(dbBaseUrl) ? dbBaseUrl : (_configuration["AiSettings:BaseUrl"] ?? "https://token-plan-sgp.xiaomimimo.com/v1");
            var model = !string.IsNullOrEmpty(dbModel) ? dbModel : (_configuration["AiSettings:Model"] ?? "mimo-v2.5");

            if (string.IsNullOrEmpty(apiKey))
            {
                // Fallback to empty map if no API key is provided
                return new Dictionary<string, string>();
            }

            // OpenAI API compatible endpoint
            var url = $"{baseUrl.TrimEnd('/')}/chat/completions";

            var prompt = @"Bạn là một trợ lý thông minh chuyên phân tích các cột Excel của hệ thống quản lý trung tâm giáo dục.
Nhiệm vụ của bạn: Từ danh sách các Tên Cột dưới đây, hãy tìm ra tên cột TƯƠNG ỨNG với các trường dữ liệu hệ thống yêu cầu.
Các trường dữ liệu hệ thống:
- Date: Ngày học
- Time: Giờ học
- Class: Tên lớp học
- StudentCount: Sĩ số
- Teacher: Giáo viên
- Assistant: Trợ giảng (Có thể là Trợ giảng, Trợ giảng phụ trách, Trợ giảng chính)
- LocalAssistant: Trợ giảng mầm non (Hoặc Trợ giảng tại MN, Local Assistant)
- LessonProgress: Tiến độ bài giảng
- Notes: Ghi chú

Hãy trả về kết quả định dạng JSON chuẩn (Chỉ trả về JSON, không chứa markdown hay text nào khác). Cấu trúc:
{
  ""Date"": ""Tên cột tương ứng"",
  ""Time"": ""Tên cột tương ứng"",
  ""Class"": ""Tên cột tương ứng"",
  ""StudentCount"": ""Tên cột tương ứng"",
  ""Teacher"": ""Tên cột tương ứng"",
  ""Assistant"": ""Tên cột tương ứng"",
  ""LocalAssistant"": ""Tên cột tương ứng"",
  ""LessonProgress"": ""Tên cột tương ứng"",
  ""Notes"": ""Tên cột tương ứng""
}
Nếu không tìm thấy cột nào phù hợp với một trường, hãy để giá trị là chuỗi rỗng """".

Danh sách các Tên Cột trong file Excel: " + string.Join(", ", headers);

            var requestBody = new
            {
                model = model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                },
                temperature = 0.1
            };

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var doc = JsonDocument.Parse(responseString);
                    var text = doc.RootElement
                                  .GetProperty("choices")[0]
                                  .GetProperty("message")
                                  .GetProperty("content").GetString();

                    // --- TOKEN COST TRACKING ---
                    try 
                    {
                        if (doc.RootElement.TryGetProperty("usage", out var usageProp))
                        {
                            decimal promptTokens = 0, completionTokens = 0, cacheHitTokens = 0, cacheMissTokens = 0;
                            
                            if (usageProp.TryGetProperty("prompt_tokens", out var pt)) promptTokens = pt.GetDecimal();
                            if (usageProp.TryGetProperty("completion_tokens", out var ct)) completionTokens = ct.GetDecimal();
                            
                            if (usageProp.TryGetProperty("prompt_cache_hit_tokens", out var ht)) {
                                cacheHitTokens = ht.GetDecimal();
                                cacheMissTokens = promptTokens - cacheHitTokens;
                            } else {
                                cacheMissTokens = promptTokens;
                            }

                            bool isMimo = model.ToLower().Contains("mimo");
                            bool isZhipu = model.ToLower().Contains("glm");
                            
                            decimal priceHit = 0m, priceMiss = 0m, priceOut = 0m;
                            string provider = "OpenAI/DeepSeek";
                            
                            if (isZhipu) {
                                provider = "Zhipu AI";
                                priceHit = await GetPriceAsync("ZHIPU_PRICE_INPUT_CACHE_HIT", 0.10m);
                                priceMiss = await GetPriceAsync("ZHIPU_PRICE_INPUT_CACHE_MISS", 0.10m);
                                priceOut = await GetPriceAsync("ZHIPU_PRICE_OUTPUT", 0.10m);
                            } else if (isMimo) {
                                provider = "MiMo";
                                priceHit = await GetPriceAsync("MIMO_PRICE_INPUT_CACHE_HIT", 0.0028m);
                                priceMiss = await GetPriceAsync("MIMO_PRICE_INPUT_CACHE_MISS", 0.14m);
                                priceOut = await GetPriceAsync("MIMO_PRICE_OUTPUT", 0.28m);
                            } else {
                                priceHit = await GetPriceAsync("OPENAI_PRICE_INPUT_CACHE_HIT", 0.15m);
                                priceMiss = await GetPriceAsync("OPENAI_PRICE_INPUT_CACHE_MISS", 0.15m);
                                priceOut = await GetPriceAsync("OPENAI_PRICE_OUTPUT", 0.60m);
                            }

                            decimal costHit = (cacheHitTokens / 1_000_000m) * priceHit;
                            decimal costMiss = (cacheMissTokens / 1_000_000m) * priceMiss;
                            decimal costOut = (completionTokens / 1_000_000m) * priceOut;
                            decimal totalCost = costHit + costMiss + costOut;
                            _logger.LogInformation(
                                "AI Usage Report | Provider: {Provider} | Model: {Model}\n" +
                                "- Cache Hit Tokens: {HitTokens} (Cost: ${CostHit} USD)\n" +
                                "- Cache Miss Tokens: {MissTokens} (Cost: ${CostMiss} USD)\n" +
                                "- Output Tokens: {OutputTokens} (Cost: ${CostOut} USD)\n" +
                                "=> TOTAL COST: ${TotalCost} USD", 
                                provider, model, cacheHitTokens, costHit, cacheMissTokens, costMiss, completionTokens, costOut, totalCost);

                            // Ghi AuditLog
                            using (var scope = _scopeFactory.CreateScope())
                            {
                                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                                var currentUserService = scope.ServiceProvider.GetRequiredService<ICurrentUserService>();

                                var auditLog = new AuditLog
                                {
                                    Action = "AI_USAGE_LOG",
                                    EntityType = "AI_USAGE",
                                    EntityId = Guid.Empty,
                                    UserId = currentUserService.UserId,
                                    OrganizationId = currentUserService.OrganizationId,
                                    NewData = JsonSerializer.Serialize(new
                                    {
                                        Provider = provider,
                                        Model = model,
                                        HitTokens = cacheHitTokens,
                                        MissTokens = cacheMissTokens,
                                        OutputTokens = completionTokens,
                                        TotalCost = totalCost,
                                        Currency = "USD"
                                    }),
                                    IpAddress = "System",
                                    UserAgent = "DynamicAiMappingService"
                                };

                                await unitOfWork.Repository<AuditLog>().AddAsync(auditLog);
                                await unitOfWork.CommitAsync();
                                
                                var realtimeNotification = scope.ServiceProvider.GetService<IRealtimeNotificationService>();
                                if (realtimeNotification != null)
                                {
                                    await realtimeNotification.SendToAllAsync("AuditLogUpdated");
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse usage tokens or calculate cost.");
                    }
                    // --- END TOKEN COST TRACKING ---

                    if (!string.IsNullOrEmpty(text))
                    {
                        // Clean markdown if it exists (some models ignore response_format)
                        text = text.Replace("```json", "").Replace("```", "").Trim();
                        return JsonSerializer.Deserialize<Dictionary<string, string>>(text) ?? new Dictionary<string, string>();
                    }
                }
                else
                {
                    var errorStr = await response.Content.ReadAsStringAsync();
                    _logger.LogError("AI API Error. StatusCode: {StatusCode}, Error: {ErrorStr}", response.StatusCode, errorStr);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI Exception: {Message}", ex.Message);
            }

            return new Dictionary<string, string>();
        }
    }
}
