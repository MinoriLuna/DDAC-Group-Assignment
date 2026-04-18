namespace backend.Services.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(string subject, string message);
}