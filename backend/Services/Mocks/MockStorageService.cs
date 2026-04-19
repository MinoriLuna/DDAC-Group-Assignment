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

        public async Task<bool> DeleteFileAsync(string fileUrl, string bucketName)
        {
            try
            {
                // 1. Point to the wwwroot folder
                var rootDir = Directory.GetCurrentDirectory();
                var wwwroot = Path.Combine(rootDir, "wwwroot");

                // 2. Map the URL back to a physical file path on your computer
                // fileUrl looks like "/records/123_test.pdf" -> we remove the front slash
                var relativePath = fileUrl.TrimStart('/');
                var filePath = Path.Combine(wwwroot, relativePath);

                // 3. Check if it actually exists, then nuke it
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
    }
}