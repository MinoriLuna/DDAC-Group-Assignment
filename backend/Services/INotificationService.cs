namespace backend.Services;

public interface INotificationService
{
    Task SendSmsAsync(string phoneNumber, string message);
}