namespace backend.Services.Interfaces;

public interface IStorageService
{
    // Returns the URL of the uploaded file
    Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "");
}