namespace backend.Services;

public interface IStorageService
{
    // Returns the URL of the uploaded file
    Task<string> UploadFileAsync(IFormFile file, string folderName);
}