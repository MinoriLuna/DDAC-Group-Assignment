using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("internal_messages", Schema = "public")]
public class InternalMessage
{
    [Key]
    [Column("messageid")]
    public Guid MessageId { get; set; } = Guid.NewGuid();

    [Column("senderid")]
    public Guid SenderId { get; set; }

    [Column("receiverid")]
    public Guid ReceiverId { get; set; }

    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [Column("sentat")]
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    [Column("isread")]
    public bool IsRead { get; set; } = false;

    [ForeignKey("SenderId")]
    public User? Sender { get; set; }

    [ForeignKey("ReceiverId")]
    public User? Receiver { get; set; }
}
