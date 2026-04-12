namespace backend.Services;

public class MockNotificationService : INotificationService
{
    public Task SendSmsAsync(string phoneNumber, string message)
    {
        Console.WriteLine("******************************************");
        Console.WriteLine($"[SNS MOCK] SMS TO: {phoneNumber}");
        Console.WriteLine($"[SNS MOCK] MESSAGE: {message}");
        Console.WriteLine("******************************************");
        return Task.CompletedTask;
    }
}