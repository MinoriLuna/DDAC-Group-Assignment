namespace backend.Services.Interfaces;

public interface ISqsService
{
    Task EnqueueEmailAsync(string email, string name, string action, string details);
}