using Amazon.Comprehend;
using Amazon.Comprehend.Model;
using Amazon.Runtime;

namespace backend.Services.AWS;

public class ComprehendService
{
    private readonly IConfiguration _config;

    public ComprehendService(IConfiguration config) => _config = config;

    private IAmazonComprehend GetClient()
    {
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );
        return new AmazonComprehendClient(credentials, Amazon.RegionEndpoint.USEast1);
    }

    public async Task<string> DetectSentimentAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "NEUTRAL";

        using var client = GetClient();
        var response = await client.DetectSentimentAsync(new DetectSentimentRequest
        {
            Text = text,
            LanguageCode = "en"
        });

        return response.Sentiment.Value;
    }
}
