using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
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
        var userId = Guid.Parse(User.FindFirst("userId")?.Value);
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
    public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = Guid.Parse(User.FindFirst("userId")?.Value);
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
        if (user == null) return NotFound();

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.Phone = request.Phone;     
        user.Address = request.Address; 

        _context.SaveChanges();
        return Ok(new { message = "Success" });
    }
}

public class UpdateProfileRequest {
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string Address { get; set; }
}