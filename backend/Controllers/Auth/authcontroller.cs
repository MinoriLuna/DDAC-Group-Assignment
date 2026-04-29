using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config; // This lets us read appsettings.json
    private readonly INotificationService _notificationService;

    public AuthController(ApplicationDbContext context, IConfiguration config, INotificationService notificationService)
    {
        _context = context;
        _config = config;
        _notificationService = notificationService;
    }

    // --- TASK 1: REGISTER ---
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
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
                // SCRAMBLE THE PASSWORD
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            _context.SaveChanges();
            Console.WriteLine("---> SUCCESS: User saved with hashed password.\n");

            // Subscribe user's email to SNS notifications
            try
            {
                await _notificationService.SubscribeEmailAsync(request.Email);
                Console.WriteLine($"---> SNS: Email {request.Email} subscribed to notifications");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"---> SNS ERROR: {ex.Message}");
                // Don't fail registration if SNS fails, just log it
            }

            return Ok(new { message = "Registration successful!" });
        }
        catch (Exception ex) {
            Console.WriteLine($"---> DATABASE ERROR: {ex.Message}");
            return StatusCode(500, new { message = "Database error." });
        }
    }

    // --- TASK 2: LOGIN WITH JWT ---
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"---> LOGIN ATTEMPT: {request.Email}");

        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

        // Verify the scrambled password
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            Console.WriteLine("---> LOGIN FAILED: Invalid credentials.");
            return Unauthorized(new { message = "Invalid email or password!" });
        }

        // Generating JWT
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] {
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("userId", user.UserId.ToString())
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = _config["Jwt:Issuer"],
            Audience = _config["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        Console.WriteLine($"---> LOGIN SUCCESS: JWT Issued for {user.FullName}");

        return Ok(new {
            message = "Login successful!",
            token = tokenString, // Next.js will store this
            user = new {
                fullName = user.FullName,
                role = user.Role
            }
        });
    }
}

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
