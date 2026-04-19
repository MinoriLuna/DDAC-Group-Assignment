using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public enum AppointmentStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

[Table("appointments", Schema = "public")]
public class Appointment
{
    [Key]
    [Column("appointmentid")]
    public Guid AppointmentId { get; set; } = Guid.NewGuid();

    [Column("patientid")]
    public Guid PatientId { get; set; }

    [Column("doctorid")]
    public Guid DoctorId { get; set; }

    [Column("appointmentdate")]
    public DateOnly AppointmentDate { get; set; }

    [Column("appointmenttime")]
    public TimeOnly AppointmentTime { get; set; }

    [Column("reason")]
    public string? Reason { get; set; } // Nullable because your SQL said "text null"

    [Column("status")]
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("doctornotes")]
    public string? DoctorNotes { get; set; }

    [Column("prescription")]
    public string? Prescription { get; set; }

    [ForeignKey("PatientId")]
    public User? Patient { get; set; }

    [ForeignKey("DoctorId")]
    public User? Doctor { get; set; }
}