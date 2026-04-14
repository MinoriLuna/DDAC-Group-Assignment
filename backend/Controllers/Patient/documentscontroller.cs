using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Services.Interfaces;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class DocumentsController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ApplicationDbContext _context;

        public DocumentsController(IStorageService storageService, ApplicationDbContext context)
        {
            _storageService = storageService;
            _context = context;
        }

        // --- 1. UPLOAD NEW RECORD TO S3 VAULT & SAVE TO DB ---
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

            try
            {
                // Your reference method for the token
                var userIdValue = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
                var userId = Guid.Parse(userIdValue);

                // 1. Storage Upload
                string fileUrl = await _storageService.UploadFileAsync(file, "medical-vault-bucket", "records");

                // 2. Database Save (FIXED .Length HERE)
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

                return Ok(new { url = fileUrl, fileName = file.FileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Upload Error: {ex.Message}");
            }
        }

        [HttpGet("mine")]
        public IActionResult GetMyDocuments()
        {
            try
            {
                // Using your exact reference to grab the ID
                var userIdValue = User.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
                var userId = Guid.Parse(userIdValue);

                // Check if user exists (as per your reference logic)
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