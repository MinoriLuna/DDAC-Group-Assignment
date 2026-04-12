namespace backend.Services;

public class MockStorageService : IStorageService
{
    public Task<string> UploadFileAsync(IFormFile file, string folderName)
    {
        // Just simulates an upload and returns a fake path
        Console.WriteLine($"[S3 MOCK] Uploading {file.FileName} to bucket folder: {folderName}");
        return Task.FromResult($"https://fake-s3-link.com/{folderName}/{file.FileName}");
    }
}