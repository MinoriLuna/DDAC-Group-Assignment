using Amazon.SQS;
using Amazon.SQS.Model;
using backend.Services.Interfaces;
using System.Text.Json;

namespace backend.Services.AWS;

public class MessageQueueService : IMessageQueue
{
    private readonly IAmazonSQS _sqsClient;
    private readonly IConfiguration _config;
    private readonly ILogger<MessageQueueService> _logger;

    public MessageQueueService(IAmazonSQS sqsClient, IConfiguration config, ILogger<MessageQueueService> logger)
    {
        _sqsClient = sqsClient;
        _config = config;
        _logger = logger;
    }

    public async Task AddToQueueAsync(string queueName, object message)
    {
        var queueUrl = _config["AWS:SqsQueueUrl"] ?? _config["AWS__SqsQueueUrl"];

        if (string.IsNullOrEmpty(queueUrl))
        {
            _logger.LogWarning("SQS Queue URL not configured, skipping queue for: {QueueName}", queueName);
            return;
        }

        var body = JsonSerializer.Serialize(message);
        await _sqsClient.SendMessageAsync(new SendMessageRequest
        {
            QueueUrl = queueUrl,
            MessageBody = body
        });

        _logger.LogInformation("Queued event to {QueueName}", queueName);
    }
}
