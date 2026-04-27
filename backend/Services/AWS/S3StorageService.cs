using Amazon.S3;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;

namespace backend.Services.AWS;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client; // Inject the client directly

    // The SDK automatically finds the LabInstanceProfile keys
    public S3StorageService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
    {
        // No 'using' block needed here because DI manages the client lifetime
        var fileTransferUtility = new TransferUtility(_s3Client);

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
            Uri uri = new Uri(fileUrl);
            string key = uri.AbsolutePath.TrimStart('/');

            var deleteRequest = new Amazon.S3.Model.DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"S3 Delete Error: {ex.Message}");
            return false;
        }
    }
}