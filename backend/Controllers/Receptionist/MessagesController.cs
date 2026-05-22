using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/receptionist/messages")]
public class ReceptionistMessagesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ReceptionistMessagesController(ApplicationDbContext db) => _db = db;

    // GET /api/receptionist/messages/contacts
    [HttpGet("contacts")]
    public IActionResult GetContacts()
    {
        var staff = _db.Users
            .Where(u => u.Role == "Doctor" || u.Role == "Receptionist")
            .Select(u => new { id = u.UserId, name = u.FullName, role = u.Role })
            .ToList();

        var patients = _db.Users
            .Where(u => u.Role == "Patient")
            .Select(u => new { id = u.UserId, name = u.FullName, role = "Patient" })
            .ToList();

        return Ok(new { staff, patients });
    }

    // GET /api/receptionist/messages/{contactId}
    [HttpGet("{contactId}")]
    [Authorize]
    public IActionResult GetConversation(Guid contactId)
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var messages = _db.InternalMessages
            .Where(m =>
                (m.SenderId == userId   && m.ReceiverId == contactId) ||
                (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .ToList()
            .Select(m => new
            {
                id     = m.MessageId,
                sender = m.SenderId == userId ? "me" : GetSenderName(m.SenderId),
                text   = m.Content,
                time   = m.SentAt.ToString("hh:mm tt")
            })
            .ToList();

        return Ok(messages);
    }

    // PATCH /api/receptionist/messages/{contactId}/read
    [HttpPatch("{contactId}/read")]
    [Authorize]
    public async Task<IActionResult> MarkRead(Guid contactId)
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var unread = _db.InternalMessages
            .Where(m => m.SenderId == contactId && m.ReceiverId == userId && !m.IsRead)
            .ToList();

        foreach (var m in unread)
            m.IsRead = true;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Messages marked as read." });
    }

    // POST /api/receptionist/messages
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest req)
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var message = new InternalMessage
        {
            SenderId   = userId,
            ReceiverId = req.ReceiverId,
            Content    = req.Content,
            SentAt     = DateTime.UtcNow,
            IsRead     = false
        };

        _db.InternalMessages.Add(message);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id     = message.MessageId,
            sender = "me",
            text   = message.Content,
            time   = message.SentAt.ToString("hh:mm tt")
        });
    }

    private string GetSenderName(Guid senderId)
    {
        return _db.Users
            .Where(u => u.UserId == senderId)
            .Select(u => u.FullName)
            .FirstOrDefault() ?? "Unknown";
    }
}

public class SendMessageRequest
{
    public Guid   ReceiverId { get; set; }
    public string Content    { get; set; } = string.Empty;
}
