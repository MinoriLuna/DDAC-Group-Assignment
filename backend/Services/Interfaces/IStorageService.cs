namespace backend.Services.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "");
    Task<string> GetDownloadUrlAsync(string fileUrl, string bucketName);
}