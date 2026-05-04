using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using backend.Services.Interfaces;

namespace backend.Services.AWS;

public class SnsNotificationService : INotificationService
{
    private readonly IAmazonSimpleNotificationService _snsClient;
    private readonly IConfiguration _config;

    // Inject the SNS client directly
    public SnsNotificationService(IAmazonSimpleNotificationService snsClient, IConfiguration config)
    {
        _snsClient = snsClient;
        _config = config;
    }

    public async Task SendNotificationAsync(string subject, string message)
    {
        // Note: _config["AWS:SnsTopicArn"] handles the AWS__SnsTopicArn property
        var topicArn = _config["AWS:SnsTopicArn"];

        if (string.IsNullOrEmpty(topicArn))
        {
            throw new Exception("SNS Topic ARN is missing from configuration.");
        }

        var request = new PublishRequest
        {
            TopicArn = topicArn,
            Subject = subject,
            Message = message
        };

        // Use the injected client
        await _snsClient.PublishAsync(request);
    }

    public async Task<string> SubscribeEmailAsync(string email)
    {
        var topicArn = _config["AWS:SnsTopicArn"];

        if (string.IsNullOrEmpty(topicArn))
        {
            throw new Exception("SNS Topic ARN is missing from configuration.");
        }

        var request = new SubscribeRequest
        {
            TopicArn = topicArn,
            Protocol = "email",
            Endpoint = email
        };

        var response = await _snsClient.SubscribeAsync(request);
        return response.SubscriptionArn;
    }
}
