namespace backend.Services.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(string subject, string message);
    Task<string> SubscribeEmailAsync(string email);
    Task SendSmsAsync(string phoneNumber, string message);
}
