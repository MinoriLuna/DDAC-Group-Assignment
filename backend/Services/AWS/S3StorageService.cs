using Amazon.S3;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;
using Amazon.Runtime;

namespace backend.Services.AWS; // Double check this namespace matches your folder structure

public class S3StorageService : IStorageService
{
    private readonly IConfiguration _config;

    public S3StorageService(IConfiguration config)
    {
        _config = config;
    }

    private IAmazonS3 GetS3Client()
    {
        // This pulls your keys from appsettings 
        var credentials = new SessionAWSCredentials(
            _config["AWS:AccessKey"],
            _config["AWS:SecretKey"],
            _config["AWS:SessionToken"]
        );

        return new AmazonS3Client(credentials, Amazon.RegionEndpoint.USEast1);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
    {
        using var s3Client = GetS3Client();
        var fileTransferUtility = new TransferUtility(s3Client);
        
        string fileName = $"{Guid.NewGuid()}_{file.FileName}";
        string key = string.IsNullOrEmpty(prefix) ? fileName : $"{prefix}/{fileName}";

        using (var stream = file.OpenReadStream())
        {
            await fileTransferUtility.UploadAsync(stream, bucketName, key);
        }

        return $"https://{bucketName}.s3.amazonaws.com/{key}";
    }
}