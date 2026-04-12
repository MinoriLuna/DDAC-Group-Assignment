namespace backend.Services.Interfaces;

public interface INotificationService
{
    Task SendSmsAsync(string phoneNumber, string message);
}