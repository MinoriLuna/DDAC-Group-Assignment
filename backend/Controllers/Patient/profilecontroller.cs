using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class ProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public ProfileController(ApplicationDbContext context) { _context = context; }

    [HttpGet("profile")]
    public IActionResult GetMyProfile()
    {
        var userIdValue = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
        var userId = Guid.Parse(userIdValue);
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
        if (user == null) return NotFound();

        return Ok(new {
            fullName = user.FullName,
            email = user.Email,
            role = user.Role,
            phone = user.Phone,
            address = user.Address, 
            createdAt = user.CreatedAt
        });
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userIdValue = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdValue)) return Unauthorized();
            var userId = Guid.Parse(userIdValue);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound(new { message = "User not found." });

            user.FullName = request.FullName ?? user.FullName;
            user.Email = request.Email ?? user.Email;
            user.Phone = request.Phone ?? user.Phone;
            user.Address = request.Address ?? user.Address;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Success" });
        }
        catch
        {
            return StatusCode(500, new { message = "Failed to update profile. Please try again." });
        }
    }
}

public class UpdateProfileRequest {
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}