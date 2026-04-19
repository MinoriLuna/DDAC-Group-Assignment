using backend.Services.Interfaces;
namespace backend.Services.Mocks;

public class MockQueueService : IMessageQueue
{
    public Task AddToQueueAsync(string queueName, object messageBody)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(messageBody);
        Console.WriteLine($"[SQS MOCK] Added to queue '{queueName}': {json}");
        return Task.CompletedTask;
    }

    // NEW: Mocking the retrieval of logs
    public Task<List<object>> ReceiveAuditLogsAsync()
    {
        Console.WriteLine("[SQS MOCK] Admin requested audit logs retrieval.");

        // Return some dummy data so your Admin UI doesn't look empty during testing
        var mockLogs = new List<object>
        {
            new { 
                LogId = "mock-uuid-1", 
                OccurredAt = DateTime.Now.AddMinutes(-5).ToString("O"), 
                Action = "Test: Patient uploaded X-Ray image.", 
                Source = "MOCK_SNS_FANOUT" 
            },
            new { 
                LogId = "mock-uuid-2", 
                OccurredAt = DateTime.Now.AddMinutes(-1).ToString("O"), 
                Action = "Test: Patient booked an appointment with Dr. Smith.", 
                Source = "MOCK_SNS_FANOUT" 
            }
        };

        return Task.FromResult(mockLogs);
    }
}