using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using Amazon.Runtime;
using backend.Services.Interfaces; // Ensure this matches your interface folder

namespace backend.Services.AWS;

public class SnsNotificationService : INotificationService
{
    private readonly IConfiguration _config;

    public SnsNotificationService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendNotificationAsync(string subject, string message)
    {
        // Pulling your 4-hour Learner Lab keys
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );

        using var client = new AmazonSimpleNotificationServiceClient(credentials, Amazon.RegionEndpoint.USEast1);
        
        var request = new PublishRequest
        {
            // Pulling the ARN we created in the console
            TopicArn = _config["AWS:SnsTopicArn"],
            Subject = subject,
            Message = message
        };

        await client.PublishAsync(request);
    }
}