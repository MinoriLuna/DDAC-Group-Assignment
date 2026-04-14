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
            _env = env; // This is what allows C# to find the right folder
        }

        public async Task<string> UploadFileAsync(IFormFile file, string bucketName, string prefix = "")
        {
            // 1. Point exactly to your backend directory and create a wwwroot folder
            var rootDir = Directory.GetCurrentDirectory();
            var wwwroot = Path.Combine(rootDir, "wwwroot");
            
            // 2. Create the specific "folder" based on the prefix (e.g., "records" or "avatars")
            var targetFolder = Path.Combine(wwwroot, prefix);
            Directory.CreateDirectory(targetFolder);

            // 3. Make a safe, unique filename
            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(targetFolder, uniqueFileName);

            // 4. THIS is the magic line that actually writes the file to your hard drive!
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine($"\n[S3 MOCK] Success! File physically saved to: {filePath}\n");
            Console.ResetColor();

            // 5. Return the local URL so the frontend can use it
            return $"/{prefix}/{uniqueFileName}";
        }
    }
}