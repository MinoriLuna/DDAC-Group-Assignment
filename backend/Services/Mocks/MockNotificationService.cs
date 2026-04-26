using backend.Services.Interfaces;

namespace backend.Services.Mocks; // Ensure this matches your folder structure

public class MockNotificationService : INotificationService
{
    public Task SendNotificationAsync(string subject, string message)
    {
        // This just prints to your local terminal so the build doesn't break
        Console.WriteLine("------------------------------------------");
        Console.WriteLine("[MOCK SNS NOTIFICATION SENT]");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine($"Message: {message}");
        Console.WriteLine("------------------------------------------");
        
        return Task.CompletedTask;
    }
}