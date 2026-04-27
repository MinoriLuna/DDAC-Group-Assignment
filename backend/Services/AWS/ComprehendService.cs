using Amazon.Comprehend;
using Amazon.Comprehend.Model;

namespace backend.Services.AWS;

public class ComprehendService
{
    private readonly IAmazonComprehend _comprehendClient;

    // Inject the client directly - NO manual credentials or SessionAWSCredentials!
    public ComprehendService(IAmazonComprehend comprehendClient)
    {
        _comprehendClient = comprehendClient;
    }

    public async Task<string> DetectSentimentAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "NEUTRAL";

        // Use the injected client provided by the LabInstanceProfile
        var response = await _comprehendClient.DetectSentimentAsync(new DetectSentimentRequest
        {
            Text = text,
            LanguageCode = "en"
        });

        return response.Sentiment.Value;
    }
}