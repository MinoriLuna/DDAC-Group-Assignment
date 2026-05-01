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

    // Doctor fields
    [Column("specialization")]
    public string? Specialization { get; set; }

    [Column("licensenumber")]
    public string? LicenseNumber { get; set; }

    [Column("department")]
    public string? Department { get; set; }

    [Column("isavailable")]
    public bool IsAvailable { get; set; } = true;

    [Column("availabledays")]
    public string? AvailableDays { get; set; }

    [Column("availablefrom")]
    public string? AvailableFrom { get; set; }

    [Column("availableto")]
    public string? AvailableTo { get; set; }

    // Patient fields
    [Column("dateofbirth")]
    public DateTime? DateOfBirth { get; set; }

    [Column("gender")]
    public string? Gender { get; set; }

    [Column("icpassport")]
    public string? IcPassport { get; set; }

    [Column("emergencycontactname")]
    public string? EmergencyContactName { get; set; }

    [Column("emergencycontactphone")]
    public string? EmergencyContactPhone { get; set; }

    [Column("emergencycontactrelation")]
    public string? EmergencyContactRelation { get; set; }
}