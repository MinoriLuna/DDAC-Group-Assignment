using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("system_notifications", Schema = "public")]
public class SystemNotification
{
    [Key]
    [Column("notificationid")]
    public Guid NotificationId { get; set; } = Guid.NewGuid();

    [Column("userid")]
    public Guid UserId { get; set; }

    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("type")]
    public string Type { get; set; } = "info";

    [Column("isread")]
    public bool IsRead { get; set; } = false;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public User? User { get; set; }
}
