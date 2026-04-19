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

    public async Task<bool> DeleteFileAsync(string fileUrl, string bucketName)
    {
        try
        {
            using var s3Client = GetS3Client();
            Uri uri = new Uri(fileUrl);
            string key = uri.AbsolutePath.TrimStart('/'); 
            
            var deleteRequest = new Amazon.S3.Model.DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key
            };

            await s3Client.DeleteObjectAsync(deleteRequest);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"S3 Delete Error: {ex.Message}");
            return false;
        }
    }
}