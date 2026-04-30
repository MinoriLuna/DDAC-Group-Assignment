using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("documents", Schema = "public")] 
public class MedicalDocument
{
    [Key]
    [Column("id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // 1. The Foreign Key Column (Must be Guid to match your User model)
    [Column("patientid")]
    public Guid PatientId { get; set; }

    [ForeignKey("PatientId")]
    public virtual User? Patient { get; set; } 

    [Column("filename")]
    public string FileName { get; set; } = string.Empty;

    [Column("fileurl")]
    public string FileUrl { get; set; } = string.Empty;

    [Column("documenttype")]
    public string DocumentType { get; set; } = "Uploaded Record";

    [Column("filesize")]
    public string FileSize { get; set; } = string.Empty;

    [Column("uploaddate")]
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
}