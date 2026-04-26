namespace backend.Services.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "");
    Task<bool> DeleteFileAsync(string fileUrl, string bucketName);
}
