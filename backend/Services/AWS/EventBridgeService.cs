using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using System.Text.Json;

namespace backend.Services.AWS;

public class EventBridgeService
{
    private readonly IAmazonEventBridge _eventClient;

    // Inject the client directly - NO manual credentials!
    public EventBridgeService(IAmazonEventBridge eventClient)
    {
        _eventClient = eventClient;
    }

    public async Task PublishAuditAsync(string actionType, object details)
    {
        var request = new PutEventsRequest
        {
            Entries = new List<PutEventsRequestEntry>
            {
                new PutEventsRequestEntry
                {
                    Source = "medicare.app", 
                    DetailType = actionType,  
                    Detail = JsonSerializer.Serialize(details),
                    EventBusName = "default"
                }
            }
        };

        // Use the injected client provided by the LabInstanceProfile
        await _eventClient.PutEventsAsync(request);
    }
}