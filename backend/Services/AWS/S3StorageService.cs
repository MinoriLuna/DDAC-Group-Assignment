using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;

namespace backend.Services.AWS;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _s3Client;

    public S3StorageService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
    {
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
            // UnescapeDataString decodes %20→space etc. so the key matches the actual S3 key
            string key = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));

            // Handle versioned buckets: list all versions and delete markers, then delete them all.
            // On non-versioned buckets, ListVersionsAsync returns a single version with null VersionId,
            // and we fall through to the regular delete below.
            try
            {
                var listResponse = await _s3Client.ListVersionsAsync(new ListVersionsRequest
                {
                    BucketName = bucketName,
                    Prefix = key
                });

                var toDelete = listResponse.Versions
                    .Select(v => new KeyVersion { Key = v.Key, VersionId = v.VersionId })
                    .ToList();

                if (toDelete.Any())
                {
                    await _s3Client.DeleteObjectsAsync(new DeleteObjectsRequest
                    {
                        BucketName = bucketName,
                        Objects = toDelete
                    });
                    return true;
                }
            }
            catch
            {
                // If versioning API is unavailable, fall through to plain delete
            }

            await _s3Client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = key
            });
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"S3 Delete Error: {ex.Message}");
            return false;
        }
    }

    public string GetPresignedUrl(string fileUrl, string bucketName, int expiryMinutes = 60)
    {
        Uri uri = new Uri(fileUrl);
        string key = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));

        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Verb = HttpVerb.GET
        };

        return _s3Client.GetPreSignedURL(request);
    }
}