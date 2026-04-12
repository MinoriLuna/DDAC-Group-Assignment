namespace backend.Services;

public class MockQueueService : IMessageQueue
{
    public Task AddToQueueAsync(string queueName, object messageBody)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(messageBody);
        Console.WriteLine($"[SQS MOCK] Added to queue '{queueName}': {json}");
        return Task.CompletedTask;
    }
}