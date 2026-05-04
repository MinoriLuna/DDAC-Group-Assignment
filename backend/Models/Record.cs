using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("records", Schema = "public")]
public class Record
{
    [Key]
    [Column("recordid")]
    public Guid RecordId { get; set; } = Guid.NewGuid();

    [Column("patientid")]
    public Guid? PatientId { get; set; }

    [Column("doctorid")]
    public Guid? DoctorId { get; set; }

    [Column("consultationnotes")]
    public string? ConsultationNotes { get; set; }

    [Column("prescription")]
    public string? Prescription { get; set; }

    [Column("visitdate")]
    public DateTime? VisitDate { get; set; }

    [ForeignKey("PatientId")]
    public User? Patient { get; set; }

    [ForeignKey("DoctorId")]
    public User? Doctor { get; set; }
}
