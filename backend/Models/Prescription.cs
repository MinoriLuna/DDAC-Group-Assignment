using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("prescriptions", Schema = "public")]
public class Prescription
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    // Which appointment this prescription was written during
    [Column("appointmentid")]
    public Guid AppointmentId { get; set; }

    [ForeignKey("AppointmentId")]
    public Appointment? Appointment { get; set; }

    // Denormalised for fast querying (avoid join to appointments just for IDs)
    [Column("doctorid")]
    public Guid DoctorId { get; set; }

    [ForeignKey("DoctorId")]
    public User? Doctor { get; set; }

    [Column("patientid")]
    public Guid PatientId { get; set; }

    [ForeignKey("PatientId")]
    public User? Patient { get; set; }

    // What the doctor diagnosed
    [Column("diagnosis")]
    public string Diagnosis { get; set; } = string.Empty;

    // Comma-separated medicines e.g. "Paracetamol 500mg 3x/day 5days, Amoxicillin 250mg 2x/day 7days"
    [Column("medicines")]
    public string Medicines { get; set; } = string.Empty;

    // Optional instructions for the patient (e.g. "take with food")
    [Column("instructions")]
    public string? Instructions { get; set; }

    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}