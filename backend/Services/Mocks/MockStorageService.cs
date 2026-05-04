using backend.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Mocks
{
    public class MockStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _env;

        public MockStorageService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
        {
            var rootDir = Directory.GetCurrentDirectory();
            var wwwroot = Path.Combine(rootDir, "wwwroot");
            var targetFolder = Path.Combine(wwwroot, prefix);
            Directory.CreateDirectory(targetFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(targetFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine($"\n[S3 MOCK] Success! File physically saved to: {filePath}\n");
            Console.ResetColor();

            return $"/{prefix}/{uniqueFileName}";
        }

        public async Task<bool> DeleteFileAsync(string fileUrl, string bucketName)
        {
            try
            {
                var rootDir = Directory.GetCurrentDirectory();
                var wwwroot = Path.Combine(rootDir, "wwwroot");
                var relativePath = fileUrl.TrimStart('/');
                var filePath = Path.Combine(wwwroot, relativePath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    Console.ForegroundColor = ConsoleColor.Magenta;
                    Console.WriteLine($"\n[S3 MOCK] Success! File physically deleted from: {filePath}\n");
                    Console.ResetColor();
                    return true;
                }

                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine($"\n[S3 MOCK WARNING] File not found. Tried to delete: {filePath}\n");
                Console.ResetColor();
                return false;
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\n[S3 MOCK ERROR] Failed to delete: {ex.Message}\n");
                Console.ResetColor();
                return false;
            }
        }

        public string GetPresignedUrl(string fileUrl, string bucketName, int expiryMinutes = 60)
        {
            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine($"\n[S3 MOCK] GetPresignedUrl called for: {fileUrl}\n");
            Console.ResetColor();
            return fileUrl;
        }
    }
}
