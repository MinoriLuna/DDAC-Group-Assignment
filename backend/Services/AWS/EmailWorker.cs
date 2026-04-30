using Amazon.SQS;
using Amazon.SQS.Model;
using Amazon.SimpleNotificationService; // FIXED: Added for SNS
using Amazon.SimpleNotificationService.Model; // FIXED: Added for PublishRequest
using System.Text.Json;

namespace backend.Services.AWS;

public class EmailWorker : BackgroundService
{
    private readonly IAmazonSQS _sqsClient;
    private readonly IAmazonSimpleNotificationService _snsClient; // FIXED: Declared field
    private readonly IConfiguration _config;
    private readonly ILogger<EmailWorker> _logger;

    public EmailWorker(
        IAmazonSQS sqsClient, 
        IAmazonSimpleNotificationService snsClient, // FIXED: Injected via constructor
        IConfiguration config,
        ILogger<EmailWorker> logger)
    {
        _sqsClient = sqsClient;
        _snsClient = snsClient; // FIXED: Initialized field
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueUrl = _config["AWS:SqsQueueUrl"];

        if (string.IsNullOrEmpty(queueUrl))
        {
            _logger.LogCritical("[WORKER] SQS Queue URL is missing.");
            return;
        }

        _logger.LogInformation("[WORKER] Background Service started. Polling: {QueueUrl}", queueUrl);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var receiveRequest = new ReceiveMessageRequest
                {
                    QueueUrl = queueUrl,
                    MaxNumberOfMessages = 5,
                    WaitTimeSeconds = 20 
                };

                var response = await _sqsClient.ReceiveMessageAsync(receiveRequest, stoppingToken);

                foreach (var message in response.Messages)
                {
                    var data = JsonSerializer.Deserialize<EmailMessageDto>(message.Body);
                    
                    if (data != null)
                    {
                        // FIXED: Now calls the SNS version since SES is blocked
                        await SendSnsNotification(data);
                    }

                    await _sqsClient.DeleteMessageAsync(queueUrl, message.ReceiptHandle, stoppingToken);
                    _logger.LogInformation("[WORKER] Task Complete: Message deleted from SQS.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("[WORKER] Error: {Message}", ex.Message);
            }

            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task SendSnsNotification(EmailMessageDto data)
    {
        var topicArn = _config["AWS:SnsTopicArn"];

        if (string.IsNullOrEmpty(topicArn))
        {
            _logger.LogError("[WORKER] SNS Topic ARN is missing.");
            return;
        }

        var request = new PublishRequest
        {
            TopicArn = topicArn,
            Subject = $"MediCare+ Appointment {data.Status}",
            Message = $"Hello {data.PatientName},\n\nYour appointment status is: {data.Status}.\n\nDetails: {data.MessageBody}"
        };

        // FIXED: _snsClient now exists in the current context
        await _snsClient.PublishAsync(request);
        _logger.LogInformation("[WORKER] Success: Notification pushed to SNS Topic for {Email}", data.RecipientEmail);
    }
}

public class EmailMessageDto
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string MessageBody { get; set; } = string.Empty;
}