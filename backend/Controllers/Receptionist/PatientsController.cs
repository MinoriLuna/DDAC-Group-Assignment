using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/receptionist/patients")]
public class ReceptionistPatientsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public ReceptionistPatientsController(ApplicationDbContext db) => _db = db;

    // GET /api/receptionist/patients
    [HttpGet]
    public IActionResult GetAll()
    {
        var patients = _db.Users
            .Where(u => u.Role == "Patient")
            .OrderByDescending(u => u.CreatedAt)
            .ToList();

        var today = DateOnly.FromDateTime(DateTime.Today);

        var result = patients.Select(p =>
        {
            var upcoming = _db.Appointments
                .Where(a => a.PatientId == p.UserId && a.AppointmentDate >= today
                    && a.Status != AppointmentStatus.Cancelled
                    && a.Status != AppointmentStatus.Completed)
                .Count();

            var lastVisit = _db.Appointments
                .Where(a => a.PatientId == p.UserId && a.Status == AppointmentStatus.Completed)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => (DateOnly?)a.AppointmentDate)
                .FirstOrDefault();

            return new
            {
                id                  = "PT-" + p.UserId.ToString("N")[..8].ToUpper(),
                realId              = p.UserId,
                name                = p.FullName,
                phone               = p.Phone ?? "",
                icPassport          = p.IcPassport ?? "",
                status              = "Active",
                registeredDate      = p.CreatedAt,
                upcomingAppointment = upcoming,
                lastVisit           = lastVisit.HasValue
                                        ? lastVisit.Value.ToString("MMM dd, yyyy")
                                        : "No visits yet"
            };
        }).ToList();

        return Ok(result);
    }

    // POST /api/receptionist/patients
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterPatientRequest req)
    {
        if (_db.Users.Any(u => u.Email == req.Email))
            return BadRequest(new { message = "Email is already registered." });

        DateTime.TryParse(req.Dob, out var dob);

        var patient = new User
        {
            Role                     = "Patient",
            FullName                 = req.FullName,
            Email                    = req.Email,
            Phone                    = req.Phone,
            Address                  = req.Address,
            IcPassport               = req.IcPassport,
            Gender                   = req.Gender,
            DateOfBirth              = dob == default ? null : DateTime.SpecifyKind(dob, DateTimeKind.Utc),
            EmergencyContactName     = req.EmergencyName,
            EmergencyContactPhone    = req.EmergencyPhone,
            EmergencyContactRelation = req.EmergencyRelation,
            PasswordHash             = BCrypt.Net.BCrypt.HashPassword("Patient@123"),
            CreatedAt                = DateTime.UtcNow
        };

        _db.Users.Add(patient);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Patient registered successfully.", patientId = patient.UserId });
    }

    // GET /api/receptionist/patients/{id}
    [HttpGet("{id}")]
    [Authorize]
    public IActionResult GetById(Guid id)
    {
        var p = _db.Users.FirstOrDefault(u => u.UserId == id && u.Role == "Patient");
        if (p == null) return NotFound(new { message = "Patient not found." });

        return Ok(new
        {
            fullName                 = p.FullName,
            email                    = p.Email,
            phone                    = p.Phone ?? "",
            address                  = p.Address ?? "",
            gender                   = p.Gender ?? "",
            icPassport               = p.IcPassport ?? "",
            dateOfBirth              = p.DateOfBirth.HasValue
                                         ? p.DateOfBirth.Value.ToString("yyyy-MM-dd")
                                         : "",
            emergencyContactName     = p.EmergencyContactName ?? "",
            emergencyContactPhone    = p.EmergencyContactPhone ?? "",
            emergencyContactRelation = p.EmergencyContactRelation ?? ""
        });
    }

    // PUT /api/receptionist/patients/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePatientRequest req)
    {
        var p = await _db.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Patient");
        if (p == null) return NotFound(new { message = "Patient not found." });

        p.FullName                 = req.FullName;
        p.Email                    = req.Email;
        p.Phone                    = req.Phone;
        p.Address                  = req.Address;
        p.Gender                   = req.Gender;
        p.EmergencyContactName     = req.EmergencyName;
        p.EmergencyContactPhone    = req.EmergencyPhone;
        p.EmergencyContactRelation = req.EmergencyRelation;

        if (DateTime.TryParse(req.Dob, out var dob))
            p.DateOfBirth = DateTime.SpecifyKind(dob, DateTimeKind.Utc);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Patient updated successfully." });
    }
}

public class RegisterPatientRequest
{
    public string  FullName          { get; set; } = string.Empty;
    public string  IcPassport        { get; set; } = string.Empty;
    public string  Dob               { get; set; } = string.Empty;
    public string  Gender            { get; set; } = string.Empty;
    public string  Phone             { get; set; } = string.Empty;
    public string  Email             { get; set; } = string.Empty;
    public string  Address           { get; set; } = string.Empty;
    public string  EmergencyName     { get; set; } = string.Empty;
    public string  EmergencyRelation { get; set; } = string.Empty;
    public string  EmergencyPhone    { get; set; } = string.Empty;
}

public class UpdatePatientRequest
{
    public string FullName          { get; set; } = string.Empty;
    public string Dob               { get; set; } = string.Empty;
    public string Gender            { get; set; } = string.Empty;
    public string Phone             { get; set; } = string.Empty;
    public string Email             { get; set; } = string.Empty;
    public string Address           { get; set; } = string.Empty;
    public string EmergencyName     { get; set; } = string.Empty;
    public string EmergencyPhone    { get; set; } = string.Empty;
    public string EmergencyRelation { get; set; } = string.Empty;
}
