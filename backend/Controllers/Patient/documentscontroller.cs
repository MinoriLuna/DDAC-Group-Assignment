using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
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
        private readonly EventBridgeService _eventBridge;

        public DocumentsController(IStorageService storageService, ApplicationDbContext context, IConfiguration config, INotificationService snsService, EventBridgeService eventBridge)
        {
            _storageService = storageService;
            _context = context;
            _config = config; // Injecting config
            _snsService = snsService; // Injecting SNS service
            _eventBridge = eventBridge; // Injecting EventBridge service
        }

        // --- 1. UPLOAD NEW RECORD TO S3 VAULT & SAVE TO DB ---
        [Authorize]
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
                string bucketName = _config["AWS:BucketName"] ?? "medicare-vault-storage-2026-ddac";

                // 2. Storage Upload
                string fileUrl = await _storageService.UploadFileAsync(file, bucketName, "records");

                // 3. Database Save (Using your specific column/property names)
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

                // --- CLOUD LOGIC A: EventBridge (Permanent Audit in CloudWatch) ---
                await _eventBridge.PublishAuditAsync("DocumentUpload", new {
                    Id = doc.Id, // Matches your [Key] column
                    FileName = file.FileName,
                    PatientId = userId,
                    S3Url = fileUrl,
                    FileSize = doc.FileSize,
                    Timestamp = DateTime.UtcNow
                });

                // --- CLOUD LOGIC B: SNS (The Email Notification) ---
                await _snsService.SendNotificationAsync(
                    "Medical Record Uploaded",
                    $"Hello! A new medical document '{file.FileName}' has been securely uploaded to the vault for Patient ID: {userId}."
                );

                return Ok(new { url = fileUrl, fileName = file.FileName, id = doc.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload Error: {ex.Message}");
            }
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                var userIdString = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                var patientId = Guid.Parse(userIdString);

                // 1. Find the document in the DB
                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == id && d.PatientId == patientId);

                if (document == null) return NotFound("Document not found or unauthorized.");

                // 2. Delete the physical file from S3
                string bucketName = _config["AWS:BucketName"] ?? "medicare-vault-storage-2026-ddac";
                bool s3Deleted = await _storageService.DeleteFileAsync(document.FileUrl, bucketName);

                if (!s3Deleted) return StatusCode(500, "Failed to delete file from cloud storage.");

                // 3. Remove from SQL Database
                _context.Documents.Remove(document);
                await _context.SaveChangesAsync();

                // 4. THE CLOUD FLEX: Audit the deletion
                await _eventBridge.PublishAuditAsync("DocumentDeleted", new {
                    DocumentId = id,
                    FileName = document.FileName,
                    PatientId = patientId,
                    Action = "PERMANENT_DELETE",
                    Timestamp = DateTime.UtcNow
                });

                return Ok(new { message = "Document permanently deleted and logged." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Delete Error: {ex.Message}");
            }
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> GetDownloadUrl(int id)
        {
            try
            {
                var userIdString = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
                var patientId = Guid.Parse(userIdString);

                var document = await _context.Documents
                    .FirstOrDefaultAsync(d => d.Id == id && d.PatientId == patientId);

                if (document == null) return NotFound("Document not found or unauthorized.");

                string bucketName = _config["AWS:BucketName"] ?? "medicare-vault-storage-2026-ddac";
                string presignedUrl = _storageService.GetPresignedUrl(document.FileUrl, bucketName, 60);

                return Ok(new { url = presignedUrl, fileName = document.FileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Download Error: {ex.Message}");
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