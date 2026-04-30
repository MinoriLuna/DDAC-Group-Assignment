using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using backend.Services.AWS; 

namespace backend.Controllers;

[ApiController]
[Route("api/reviews")] // Matches the fetch URL exactly
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly EventBridgeService _eventBridge;

    public ReviewsController(ApplicationDbContext context, EventBridgeService eventBridge)
    {
        _context = context;
        _eventBridge = eventBridge;
    }

    [Authorize]
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitReview([FromBody] ReviewSubmissionRequest request)
    {
        try
        {
            // 1. Get the patient ID securely from the login token
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) 
                return Unauthorized(new { message = "You must be logged in." });

            var patientId = Guid.Parse(userIdString);

            // 2. Save to Database (Updated to use your new 'Review' model)
            var review = new DoctorReview
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                Rating = request.Rating,
                Comment = request.Comment ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // 3. The "Cloud Flex" - Permanent Audit Trail
            await _eventBridge.PublishAuditAsync("NewDoctorReview", new {
                ReviewId = review.Id,
                DoctorId = request.DoctorId,
                PatientId = patientId,
                Rating = request.Rating,
                Timestamp = DateTime.UtcNow
            });

            return Ok(new { message = "Review submitted and audited successfully." });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }
}

// Data Transfer Object to catch the JSON from your React frontend
public class ReviewSubmissionRequest
{
    public Guid DoctorId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}