using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Amazon.Runtime;
using System.Text.Json;

namespace backend.Services.AWS;

public class EventBridgeService
{
    private readonly IConfiguration _config;

    public EventBridgeService(IConfiguration config) => _config = config;

    public async Task PublishAuditAsync(string actionType, object details)
    {
        // Using your 4-hour Learner Lab credentials
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );

        using var client = new AmazonEventBridgeClient(credentials, Amazon.RegionEndpoint.USEast1);

        var request = new PutEventsRequest
        {
            Entries = new List<PutEventsRequestEntry>
            {
                new PutEventsRequestEntry
                {
                    Source = "medicare.app", // This MUST match your Rule pattern
                    DetailType = actionType,  // e.g., "PatientBooking"
                    Detail = JsonSerializer.Serialize(details),
                    EventBusName = "default"
                }
            }
        };

        await client.PutEventsAsync(request);
    }
}