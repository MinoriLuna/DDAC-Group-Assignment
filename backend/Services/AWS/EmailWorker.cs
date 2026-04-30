using Amazon.SQS;
using Amazon.SQS.Model;
using Amazon.SimpleNotificationService;
using Amazon.SimpleNotificationService.Model;
using System.Text;
using System.Text.Json;

namespace backend.Services.AWS;

public class EmailWorker : BackgroundService
{
    private readonly IAmazonSQS _sqsClient;
    private readonly IAmazonSimpleNotificationService _snsClient;
    private readonly IConfiguration _config;
    private readonly ILogger<EmailWorker> _logger;

    public EmailWorker(
        IAmazonSQS sqsClient, 
        IAmazonSimpleNotificationService snsClient, 
        IConfiguration config,
        ILogger<EmailWorker> logger)
    {
        _sqsClient = sqsClient;
        _snsClient = snsClient;
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var queueUrl = _config["AWS:SqsQueueUrl"];

        if (string.IsNullOrEmpty(queueUrl))
        {
            _logger.LogCritical("[WORKER] SQS Queue URL is missing from configuration.");
            return;
        }

        _logger.LogInformation("[WORKER] Service active. Polling: {QueueUrl}", queueUrl);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var receiveRequest = new ReceiveMessageRequest
                {
                    QueueUrl = queueUrl,
                    MaxNumberOfMessages = 5,
                    WaitTimeSeconds = 20 // Long polling to save money/resources
                };

                var response = await _sqsClient.ReceiveMessageAsync(receiveRequest, stoppingToken);

                foreach (var message in response.Messages)
                {
                    var data = JsonSerializer.Deserialize<EmailMessageDto>(message.Body);
                    
                    if (data != null)
                    {
                        await SendProfessionalSnsNotification(data);
                    }

                    await _sqsClient.DeleteMessageAsync(queueUrl, message.ReceiptHandle, stoppingToken);
                    _logger.LogInformation("[WORKER] Processed and deleted message for: {Email}", data?.RecipientEmail);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("[WORKER] Processing Error: {Message}", ex.Message);
            }

            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task SendProfessionalSnsNotification(EmailMessageDto data)
    {
        var topicArn = _config["AWS:SnsTopicArn"];
        
        // Professional Subject Line
        var subject = $"[MediCare+] Appointment Update: {data.Status} - {data.PatientName}";

        // Building the Professional Plain-Text Template
        var body = new StringBuilder();
        body.AppendLine("==================================================");
        body.AppendLine("             MEDICARE+ HEALTH SYSTEM              ");
        body.AppendLine("==================================================");
        body.AppendLine($"Dear {data.PatientName},");
        body.AppendLine();
        body.AppendLine("This is an automated notification regarding your appointment status.");
        body.AppendLine();
        body.AppendLine("APPOINTMENT SUMMARY");
        body.AppendLine("--------------------------------------------------");
        body.AppendLine($"Current Status:  {data.Status.ToUpper()}");
        body.AppendLine($"Update Details:  {data.MessageBody}");
        body.AppendLine("--------------------------------------------------");
        body.AppendLine();
        body.AppendLine("If you have any questions or did not request this update,");
        body.AppendLine("please contact our administration office immediately.");
        body.AppendLine();
        body.AppendLine("Thank you for choosing MediCare+.");
        body.AppendLine();
        body.AppendLine("Best Regards,");
        body.AppendLine("MediCare+ Administration Team");
        body.AppendLine("==================================================");
        body.AppendLine("This is a system-generated message. Please do not reply.");

        var request = new PublishRequest
        {
            TopicArn = topicArn,
            Subject = subject,
            Message = body.ToString()
        };

        await _snsClient.PublishAsync(request);
    }
}

public class EmailMessageDto
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string MessageBody { get; set; } = string.Empty;
}