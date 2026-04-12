namespace backend.Services;

public interface IMessageQueue
{
    Task AddToQueueAsync(string queueName, object messageBody);
}