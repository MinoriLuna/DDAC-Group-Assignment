using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using backend.Data;
using backend.Models;
using System.Security.Claims;
using Microsoft.Extensions.Configuration; // Added for config access
using backend.Services.AWS; 

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class DocumentsController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config; // Added configuration
        private readonly INotificationService _snsService; // Added for SNS

        public DocumentsController(IStorageService storageService, ApplicationDbContext context, IConfiguration config, INotificationService snsService)
        {
            _storageService = storageService;
            _context = context;
            _config = config; // Injecting config
            _snsService = snsService; // Injecting SNS service
        }

        // --- 1. UPLOAD NEW RECORD TO S3 VAULT & SAVE TO DB ---
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            try
            {
                var userIdValue = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
                var userId = Guid.Parse(userIdValue);

                // 1. Get the real bucket name from appsettings.json
                // If it's missing, it falls back to a default string
                string bucketName = _config["AWS:BucketName"] ?? "medicare-vault-storage-2026-ddac";

                // 2. Storage Upload (Now uses the dynamic bucket name)
                string fileUrl = await _storageService.UploadFileAsync(file, bucketName, "records");

                // 3. Database Save
                var doc = new MedicalDocument 
                { 
                    PatientId = userId, 
                    FileName = file.FileName, 
                    FileUrl = fileUrl, 
                    DocumentType = "Uploaded Record", 
                    FileSize = (file.Length / 1024.0 / 1024.0).ToString("0.0") + " MB",
                    UploadDate = DateTime.UtcNow 
                };

                _context.Documents.Add(doc);
                await _context.SaveChangesAsync();

                // 4. Send Cloud Notification
                await _snsService.SendNotificationAsync(
                    "Medical Record Uploaded",
                    $"Hello! A new medical document '{file.FileName}' has been securely uploaded to the vault for Patient ID: {userId}."
                );

                return Ok(new { url = fileUrl, fileName = file.FileName });
            }
            catch (Exception ex)
            {
                // This will now catch the "Bucket does not exist" error if the name is wrong
                return StatusCode(500, $"Upload Error: {ex.Message}");
            }
        }

        [HttpGet("mine")]
        public IActionResult GetMyDocuments()
        {
            try
            {
                var userIdValue = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
                var userId = Guid.Parse(userIdValue);

                var userExists = _context.Users.Any(u => u.UserId == userId);
                if (!userExists) return NotFound("User not found in database.");

                var myDocs = _context.Documents
                    .Where(d => d.PatientId == userId)
                    .OrderByDescending(d => d.UploadDate)
                    .Select(d => new {
                        id = d.Id,
                        name = d.FileName,
                        date = d.UploadDate.ToString("yyyy-MM-dd"),
                        type = d.DocumentType,
                        size = d.FileSize,
                        url = d.FileUrl
                    })
                    .ToList();

                return Ok(myDocs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Database Error: {ex.Message}");
            }
        }
    }
}