using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("reviews", Schema = "public")]
public class DoctorReview
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("patientid")]
    public Guid PatientId { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual User? Patient { get; set; } 

    [Column("doctorid")]
    public Guid DoctorId { get; set; }
    
    [ForeignKey("DoctorId")]
    public virtual User? Doctor { get; set; } 
    
    [Column("rating")]
    [Range(1, 5)]
    public int Rating { get; set; }     
    
    [Column("comment")]
    public string Comment { get; set; } = string.Empty;
    
    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}