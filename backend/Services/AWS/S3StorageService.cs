using Amazon.S3;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;

namespace backend.Services.AWS;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public S3StorageService(IAmazonS3 s3Client, IConfiguration config)
    {
        _s3Client = s3Client;
        // You'll set this name in your appsettings.json later
        _bucketName = config["AWS:BucketName"] ?? throw new Exception("S3 Bucket Name missing");
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folderName)
    {
        using var newStream = new MemoryStream();
        await file.CopyToAsync(newStream);

        // Generate a unique filename so people don't overwrite each other
        var fileKey = $"{folderName}/{Guid.NewGuid()}_{file.FileName}";

        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = newStream,
            Key = fileKey,
            BucketName = _bucketName,
            CannedACL = S3CannedACL.PublicRead // Makes the URL viewable by patients
        };

        var fileTransferUtility = new TransferUtility(_s3Client);
        await fileTransferUtility.UploadAsync(uploadRequest);

        // Return the actual internet URL of the file
        return $"https://{_bucketName}.s3.amazonaws.com/{fileKey}";
    }
}