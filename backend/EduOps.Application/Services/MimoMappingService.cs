using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using EduOps.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace EduOps.Application.Services
{
    public class MimoMappingService : IAiMappingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public MimoMappingService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<Dictionary<string, string>> MapExcelHeadersAsync(List<string> headers)
        {
            var apiKey = _configuration["AiSettings:ApiKey"];
            var baseUrl = _configuration["AiSettings:BaseUrl"] ?? "https://token-plan-sgp.xiaomimimo.com/v1";
            var model = _configuration["AiSettings:Model"] ?? "mimo-v2.5";

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
                temperature = 0.1,
                response_format = new { type = "json_object" }
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
                    Console.WriteLine($"MiMo API Error: {errorStr}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MiMo Exception: {ex.Message}");
            }

            return new Dictionary<string, string>();
        }
    }
}
