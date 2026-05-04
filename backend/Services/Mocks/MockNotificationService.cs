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

    public Task<string> SubscribeEmailAsync(string email)
    {
        Console.WriteLine("------------------------------------------");
        Console.WriteLine("[MOCK SNS EMAIL SUBSCRIPTION]");
        Console.WriteLine($"Email: {email}");
        Console.WriteLine("------------------------------------------");

        // Return a mock subscription ARN
        return Task.FromResult($"arn:aws:sns:us-east-1:000000000000:MediCareAlerts:mock-{Guid.NewGuid()}");
    }

    public Task SendSmsAsync(string phoneNumber, string message)
    {
        Console.WriteLine($"[MOCK SMS] To: {phoneNumber} | {message}");
        return Task.CompletedTask;
    }
}
