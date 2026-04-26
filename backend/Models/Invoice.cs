using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public enum InvoiceStatus
{
    Pending,
    Paid
}

[Table("invoices", Schema = "public")]
public class Invoice
{
    [Key]
    [Column("invoiceid")]
    public Guid InvoiceId { get; set; } = Guid.NewGuid();

    [Column("appointmentid")]
    public Guid? AppointmentId { get; set; }

    [Column("patientid")]
    public Guid PatientId { get; set; }

    [Column("totalamount")]
    public decimal TotalAmount { get; set; }

    [Column("status")]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;

    [Column("paymentmethod")]
    public string? PaymentMethod { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("paidat")]
    public DateTime? PaidAt { get; set; }

    [ForeignKey("AppointmentId")]
    public Appointment? Appointment { get; set; }

    [ForeignKey("PatientId")]
    public User? Patient { get; set; }

    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}
