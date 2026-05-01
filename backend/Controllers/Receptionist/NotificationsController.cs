using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/receptionist/notifications")]
[Authorize]
public class ReceptionistNotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ReceptionistNotificationsController(ApplicationDbContext db) => _db = db;

    // GET /api/receptionist/notifications
    [HttpGet]
    public IActionResult GetAll()
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var notifications = _db.SystemNotifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new
            {
                id        = n.NotificationId,
                title     = n.Title,
                message   = n.Message,
                type      = n.Type,
                isRead    = n.IsRead,
                createdAt = n.CreatedAt
            })
            .ToList();

        return Ok(notifications);
    }

    // PATCH /api/receptionist/notifications/read-all
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var unread = _db.SystemNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToList();

        foreach (var n in unread)
            n.IsRead = true;

        await _db.SaveChangesAsync();
        return Ok(new { message = "All notifications marked as read." });
    }

    // PATCH /api/receptionist/notifications/{id}/read
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkOneRead(Guid id)
    {
        var userIdStr = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var notification = _db.SystemNotifications
            .FirstOrDefault(n => n.NotificationId == id && n.UserId == userId);

        if (notification == null) return NotFound(new { message = "Notification not found." });

        notification.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Notification marked as read." });
    }
}
