namespace backend.Services.Interfaces;

public interface IMessageQueue
{
    Task AddToQueueAsync(string queueName, object messageBody);
    Task<List<object>> ReceiveAuditLogsAsync();
}