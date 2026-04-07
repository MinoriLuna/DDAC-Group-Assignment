using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using System.Text.Json.Serialization;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    // --- TASK 1: REGISTER ---
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        Console.WriteLine($"\n---> REGISTER ATTEMPT: {request.FullName} ({request.Email})");
        try 
        {
            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest(new { message = "Email is already registered!" });

            var newUser = new User {
                UserId = Guid.NewGuid(),
                FullName = request.FullName,
                Email = request.Email,
                Role = request.Role,
                PasswordHash = request.Password, 
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();
            Console.WriteLine("---> SUCCESS: User saved to database.\n");
            return Ok(new { message = "Registration successful!" });
        }
        catch (Exception ex) {
            Console.WriteLine($"---> DATABASE ERROR: {ex.Message}");
            return StatusCode(500, new { message = "Database error." });
        }
    }

    // --- TASK 2: LOGIN (Now safely inside the class!) ---
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"---> LOGIN ATTEMPT: {request.Email}");

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

        if (user == null || user.PasswordHash != request.Password)
        {
            Console.WriteLine("---> LOGIN FAILED: Invalid credentials.");
            return Unauthorized(new { message = "Invalid email or password!" });
        }

        Console.WriteLine($"---> LOGIN SUCCESS: Welcome back, {user.FullName}");

        return Ok(new { 
            message = "Login successful!",
            user = new {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role
            }
        });
    }
} 

// --- BLUEPRINTS (Keep these outside the controller house) ---
public class RegisterRequest
{
    [JsonPropertyName("fullName")] public string FullName { get; set; } = string.Empty;
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("password")] public string Password { get; set; } = string.Empty;
    [JsonPropertyName("role")] public string Role { get; set; } = string.Empty;
}

public class LoginRequest
{
    [JsonPropertyName("email")] public string Email { get; set; } = string.Empty;
    [JsonPropertyName("password")] public string Password { get; set; } = string.Empty;
}