using Amazon.S3;
using Amazon.S3.Transfer;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Http; 

namespace backend.Services.AWS
{
    public class S3StorageService : IStorageService
    {
        private readonly IAmazonS3 _s3Client;

        // Cleaned up the constructor since the Controller provides the bucket name
        public S3StorageService(IAmazonS3 s3Client)
        {
            _s3Client = s3Client;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
        {
            using var newStream = new MemoryStream();
            await file.CopyToAsync(newStream);

            // CRITICAL: Reset the stream position to 0, or S3 uploads an empty file!
            newStream.Position = 0;

            // Safely handle the prefix (folder). If no prefix is given, don't add a slash.
            var keyPrefix = string.IsNullOrEmpty(prefix) ? "" : $"{prefix}/";
            var fileKey = $"{keyPrefix}{Guid.NewGuid()}_{file.FileName}";

            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = newStream,
                Key = fileKey,
                BucketName = bucketName, // Uses the name passed from the Controller
                CannedACL = S3CannedACL.PublicRead // Makes the URL viewable by patients
            };

            var fileTransferUtility = new TransferUtility(_s3Client);
            await fileTransferUtility.UploadAsync(uploadRequest);

            // Return the actual internet URL of the file
            return $"https://{bucketName}.s3.amazonaws.com/{fileKey}";
        }
    }
}