using Amazon.SQS;
using Amazon.SQS.Model;
using backend.Services.Interfaces;
using System.Text.Json;

namespace backend.Services.AWS;

public class SqsQueueService : IMessageQueue
{
    private readonly IAmazonSQS _sqsClient;
    private readonly string _queueUrl;

    public SqsQueueService(IAmazonSQS sqsClient, IConfiguration config)
    {
        _sqsClient = sqsClient;
        _queueUrl = config["AWS:SQSUrl"] ?? throw new Exception("SQS URL missing");
    }

    public async Task AddToQueueAsync(string queueName, object messageBody)
    {
        var request = new SendMessageRequest
        {
            QueueUrl = _queueUrl,
            MessageBody = JsonSerializer.Serialize(messageBody)
        };

        await _sqsClient.SendMessageAsync(request);
    }
}