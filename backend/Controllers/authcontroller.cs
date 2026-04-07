using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")] // This means the URL will be /api/auth
public class AuthController : ControllerBase
{
    // This listens for a POST request at /api/auth/register
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        // For now, we are just printing it to the VS Code terminal to prove it works!
        Console.WriteLine("\n=== NEW USER REGISTERING ===");
        Console.WriteLine($"Name: {request.FullName}");
        Console.WriteLine($"Email: {request.Email}");
        Console.WriteLine($"Role: {request.Role}");
        Console.WriteLine("============================\n");

        // Send a success message back to the Next.js frontend
        return Ok(new { message = "ASP.NET says: I received your registration data!" });
    }
}

// This is the "blueprint" of the JSON data Next.js is sending us
public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}