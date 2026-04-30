using Amazon.SQS;
using Amazon.SQS.Model;
using backend.Services.Interfaces;
using System.Text.Json;

namespace backend.Services.AWS;

public class SqsService : ISqsService
{
    private readonly IAmazonSQS _sqsClient;
    private readonly IConfiguration _config;
    private readonly ILogger<SqsService> _logger;

    public SqsService(IAmazonSQS sqsClient, IConfiguration config, ILogger<SqsService> logger)
    {
        _sqsClient = sqsClient;
        _config = config;
        _logger = logger;
    }

    public async Task EnqueueEmailAsync(string email, string name, string action, string details)
    {
        var queueUrl = _config["AWS:SqsQueueUrl"];

        if (string.IsNullOrEmpty(queueUrl))
        {
            throw new Exception("SQS Queue URL is missing from configuration.");
        }

        var messageData = new
        {
            RecipientEmail = email,
            PatientName = name,
            Status = action,
            MessageBody = details
        };

        var messageBody = JsonSerializer.Serialize(messageData);

        // --- LOCAL TESTING CONSOLE ---
        Console.WriteLine($"\n[PRODUCER] ---> Attempting to queue email for: {email}");
        
        var request = new SendMessageRequest
        {
            QueueUrl = queueUrl,
            MessageBody = messageBody
        };

        await _sqsClient.SendMessageAsync(request);

        // Professional Log for CloudWatch
        _logger.LogInformation("[PRODUCER] Success: Message for {PatientName} is now in SQS.", name);
    }
}