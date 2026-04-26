using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("users", Schema = "public")] 
public class User
{
    [Key]
    [Column("userid")]
    public Guid UserId { get; set; } = Guid.NewGuid();
    [Column("role")]
    public string Role { get; set; } = string.Empty;
    [Column("fullname")]
    public string FullName { get; set; } = string.Empty;
    [Column("email")]
    public string Email { get; set; } = string.Empty;
    [Column("phone")]
    public string? Phone { get; set; }
    [Column("address")]
    public string? Address { get; set; }
    [Column("passwordhash")]
    public string PasswordHash { get; set; } = string.Empty;
    [Column("createdat")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("specialization")]
    public string? Specialization { get; set; }    

    [Column("licensenumber")]
    public string? LicenseNumber { get; set; }     

    [Column("department")]
    public string? Department { get; set; }       

    [Column("isavailable")]
    public bool IsAvailable { get; set; } = true;

    [Column("availabledays")]
    public string? AvailableDays { get; set; }   // e.g. "Mon,Tue,Wed,Thu,Fri"

    [Column("availablefrom")]
    public string? AvailableFrom { get; set; }   // e.g. "09:00"

    [Column("availableto")]
    public string? AvailableTo { get; set; }     // e.g. "17:00"
}