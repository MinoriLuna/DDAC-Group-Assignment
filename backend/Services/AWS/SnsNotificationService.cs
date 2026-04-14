using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using backend.Services.Interfaces;

namespace backend.Services.AWS;

public class SnsNotificationService : INotificationService
{
    private readonly IAmazonSimpleNotificationService _snsClient;

    public SnsNotificationService(IAmazonSimpleNotificationService snsClient)
    {
        _snsClient = snsClient;
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        var request = new PublishRequest
        {
            Message = message,
            PhoneNumber = phoneNumber // Format: +60123456789
        };

        try
        {
            await _snsClient.PublishAsync(request);
            Console.WriteLine($"[SNS REAL] Message sent to {phoneNumber}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SNS ERROR] Failed to send: {ex.Message}");
        }
    }
}