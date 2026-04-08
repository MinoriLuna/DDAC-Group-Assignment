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

    public ProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public IActionResult GetMyProfile()
    {
        // This pulls the "userId" out of the JWT passport
        var userIdClaim = User.FindFirst("userId")?.Value;
        
        if (userIdClaim == null) return Unauthorized();

        var userId = Guid.Parse(userIdClaim);
        var user = _context.Users.FirstOrDefault(u => u.UserId == userId);

        if (user == null) return NotFound();

        return Ok(new {
            fullName = user.FullName,
            email = user.Email,
            role = user.Role,
            createdAt = user.CreatedAt
        });
    }
}