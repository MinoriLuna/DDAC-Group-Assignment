using System.Text;
using System.Text.Json;

namespace backend.Services.AWS;

public class ApiGatewayService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<ApiGatewayService> _logger;

    public ApiGatewayService(HttpClient httpClient, IConfiguration config, ILogger<ApiGatewayService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task SendNotifyAsync(string subject, string patientName, string message)
    {
        var url = _config["AWS:ApiGatewayNotifyUrl"];

        if (string.IsNullOrEmpty(url))
        {
            _logger.LogWarning("[API GATEWAY] ApiGatewayNotifyUrl is not configured. Skipping.");
            return;
        }

        var payload = JsonSerializer.Serialize(new { subject, patientName, message });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(url, content);

        _logger.LogInformation("[API GATEWAY] Lambda invoked via API Gateway. Status: {Status}", response.StatusCode);
    }
}
