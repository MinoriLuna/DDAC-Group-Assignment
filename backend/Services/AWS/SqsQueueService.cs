using Amazon.SQS;
using Amazon.SQS.Model;
using Amazon.Runtime;
using backend.Services.Interfaces;
using System.Text.Json;

namespace backend.Services.AWS;

public class SqsQueueService : IMessageQueue
{
    private readonly IConfiguration _config;

    public SqsQueueService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<List<object>> ReceiveAuditLogsAsync()
    {
        // Pulling your 4-hour Learner Lab keys
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );

        using var client = new AmazonSQSClient(credentials, Amazon.RegionEndpoint.USEast1);

        var request = new ReceiveMessageRequest
        {
            QueueUrl = _config["AWS:SqsQueueUrl"], // Ensure this matches your appsettings.json
            MaxNumberOfMessages = 10,
            WaitTimeSeconds = 5 // Long polling
        };

        var response = await client.ReceiveMessageAsync(request);
        var logs = new List<object>();

        foreach (var message in response.Messages)
        {
            // Parsing the SNS envelope to get the original message text
            var jsonDoc = JsonDocument.Parse(message.Body);
            var actualMessage = jsonDoc.RootElement.GetProperty("Message").GetString();
            var timestamp = jsonDoc.RootElement.GetProperty("Timestamp").GetString();

            logs.Add(new
            {
                LogId = message.MessageId,
                OccurredAt = timestamp,
                Action = actualMessage,
                Source = "SNS_FanOut_Audit"
            });

            // Note: In a real demo, you'd delete the message here so it doesn't repeat
            // await client.DeleteMessageAsync(_config["AWS:SqsQueueUrl"], message.ReceiptHandle);
        }

        return logs;
    }

    // Keep this if you ever need to manually push a task to SQS
    public async Task AddToQueueAsync(string queueName, object messageBody)
    {
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );

        using var client = new AmazonSQSClient(credentials, Amazon.RegionEndpoint.USEast1);

        var request = new SendMessageRequest
        {
            QueueUrl = _config["AWS:SqsQueueUrl"],
            MessageBody = JsonSerializer.Serialize(messageBody)
        };

        await client.SendMessageAsync(request);
    }
}