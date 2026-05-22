using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DoctorController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notification;

    public DoctorController(
        ApplicationDbContext context,
        INotificationService notification)
    {
        _context      = context;
        _notification = notification;
    }

    // Helper: read userId Guid from JWT claim (matches existing controllers)
    private Guid GetCurrentUserId()
    {
        var userIdString = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdString))
            throw new UnauthorizedAccessException();
        return Guid.Parse(userIdString);
    }

    // PROFILE

    // GET api/doctor/profile
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = _context.Users
                .FirstOrDefault(u => u.UserId == userId && u.Role == "Doctor");

            if (user == null)
                return NotFound(new { message = "Doctor profile not found." });

            return Ok(new
            {
                userId         = user.UserId,
                fullName       = user.FullName,
                email          = user.Email,
                phone          = user.Phone,
                specialization = user.Specialization,
                licenseNumber  = user.LicenseNumber,
                department     = user.Department,
                isAvailable    = user.IsAvailable,
                availableDays  = user.AvailableDays,
                availableFrom  = user.AvailableFrom,
                availableTo    = user.AvailableTo
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PUT api/doctor/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateDoctorProfileRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = _context.Users
                .FirstOrDefault(u => u.UserId == userId && u.Role == "Doctor");

            if (user == null)
                return NotFound(new { message = "Doctor profile not found." });

            if (request.Specialization != null) user.Specialization = request.Specialization;
            if (request.LicenseNumber  != null) user.LicenseNumber  = request.LicenseNumber;
            if (request.Department     != null) user.Department     = request.Department;
            if (request.Phone          != null) user.Phone          = request.Phone;
            if (request.IsAvailable.HasValue)    user.IsAvailable    = request.IsAvailable.Value;
            if (request.AvailableDays  != null) user.AvailableDays  = request.AvailableDays;
            if (request.AvailableFrom  != null) user.AvailableFrom  = request.AvailableFrom;
            if (request.AvailableTo    != null) user.AvailableTo    = request.AvailableTo;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // APPOINTMENTS

    // GET api/doctor/appointments
    [HttpGet("appointments")]
    public IActionResult GetAppointments()
    {
        try
        {
            var doctorId = GetCurrentUserId();

            var appointments = _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    appointmentId   = a.AppointmentId,
                    patientId       = a.PatientId,
                    patientName     = _context.Users
                                        .Where(u => u.UserId == a.PatientId)
                                        .Select(u => u.FullName)
                                        .FirstOrDefault(),
                    patientPhone    = _context.Users
                                        .Where(u => u.UserId == a.PatientId)
                                        .Select(u => u.Phone)
                                        .FirstOrDefault(),
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    reason          = a.Reason,
                    status          = a.Status,
                    doctorNotes     = a.DoctorNotes,
                    noteType        = a.NoteType,
                    noteContent     = a.NoteContent
                })
                .ToList();

            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // GET api/doctor/appointments/today
    [HttpGet("appointments/today")]
    public IActionResult GetTodayAppointments()
    {
        try
        {
            var doctorId = GetCurrentUserId();
            var today    = DateOnly.FromDateTime(DateTime.UtcNow);

            var appointments = _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.AppointmentDate == today)
                .OrderBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    appointmentId   = a.AppointmentId,
                    patientId       = a.PatientId,
                    patientName     = _context.Users
                                        .Where(u => u.UserId == a.PatientId)
                                        .Select(u => u.FullName)
                                        .FirstOrDefault(),
                    patientPhone    = _context.Users
                                        .Where(u => u.UserId == a.PatientId)
                                        .Select(u => u.Phone)
                                        .FirstOrDefault(),
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    reason          = a.Reason,
                    status          = a.Status,
                    doctorNotes     = a.DoctorNotes,
                    noteType        = a.NoteType,
                    noteContent     = a.NoteContent
                })
                .ToList();

            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PATCH api/doctor/appointments/{id}/status — Complete or Cancel only
    [HttpPatch("appointments/{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(
        Guid id,
        [FromBody] UpdateAppointmentStatusRequest request)
    {
        try
        {
            // Doctors can only mark Completed or Cancelled — receptionist handles Confirmed
            if (request.Status != "Completed" && request.Status != "Cancelled")
                return StatusCode(403, new
                {
                    message = "Doctors can only mark appointments as Completed or Cancelled."
                });

            var doctorId    = GetCurrentUserId();
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == id && a.DoctorId == doctorId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.Status = Enum.Parse<AppointmentStatus>(request.Status);
            await _context.SaveChangesAsync();

            // Fetch names for SMS text
            var patient = await _context.Users.FirstOrDefaultAsync(u => u.UserId == appointment.PatientId);
            var doctor  = await _context.Users.FirstOrDefaultAsync(u => u.UserId == doctorId);

            // AWS SNS — send SMS to patient
            if (patient != null)
            {
                var msg = request.Status == "Completed"
                    ? $"Hi {patient.FullName}, your consultation with Dr. {doctor?.FullName} is complete. Log in to MediCare+ to view your prescription."
                    : $"Hi {patient.FullName}, your appointment on {appointment.AppointmentDate} was cancelled by Dr. {doctor?.FullName}. Please rebook.";

                await _notification.SendNotificationAsync("Appointment Update", msg);
            }

            return Ok(new { message = $"Appointment marked as {request.Status}. Patient notified." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PUT api/doctor/appointments/{id}/notes
    [HttpPut("appointments/{id}/notes")]
    public async Task<IActionResult> UpdateAppointmentNotes(
        Guid id,
        [FromBody] UpdateAppointmentNotesRequest request)
    {
        try
        {
            var doctorId    = GetCurrentUserId();
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == id && a.DoctorId == doctorId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            if (request.DoctorNotes != null) appointment.DoctorNotes = request.DoctorNotes;
            if (request.NoteType    != null) appointment.NoteType    = request.NoteType;
            if (request.NoteContent != null) appointment.NoteContent = request.NoteContent;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Notes saved." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PATIENTS

    // GET api/doctor/patients
    [HttpGet("patients")]
    public IActionResult GetMyPatients()
    {
        try
        {
            var doctorId = GetCurrentUserId();

            var patientIds = _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Select(a => a.PatientId)
                .Distinct()
                .ToList();

            var patients = _context.Users
                .Where(u => patientIds.Contains(u.UserId))
                .OrderBy(u => u.FullName)
                .Select(u => new
                {
                    patientId  = u.UserId,
                    fullName   = u.FullName,
                    email      = u.Email,
                    phone      = u.Phone,
                    lastVisit  = _context.Appointments
                                    .Where(a => a.DoctorId == doctorId
                                             && a.PatientId == u.UserId
                                             && a.Status == AppointmentStatus.Completed)
                                    .OrderByDescending(a => a.AppointmentDate)
                                    .Select(a => (DateOnly?)a.AppointmentDate)
                                    .FirstOrDefault(),
                    totalAppointments = _context.Appointments
                                    .Count(a => a.DoctorId == doctorId && a.PatientId == u.UserId)
                })
                .ToList();

            return Ok(patients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // GET api/doctor/patients/{patientId}
    [HttpGet("patients/{patientId}")]
    public IActionResult GetPatientDetail(Guid patientId)
    {
        try
        {
            var doctorId = GetCurrentUserId();

            // Security: only show patients this doctor has seen
            var hasRelation = _context.Appointments
                .Any(a => a.DoctorId == doctorId && a.PatientId == patientId);

            if (!hasRelation)
                return NotFound(new { message = "Patient not found or you do not have access to this patient." });

            var patient = _context.Users.FirstOrDefault(u => u.UserId == patientId);
            if (patient == null)
                return NotFound(new { message = "Patient not found." });

            var appointments = _context.Appointments
                .Where(a => a.DoctorId == doctorId && a.PatientId == patientId)
                .OrderByDescending(a => a.AppointmentDate)
                .Select(a => new
                {
                    appointmentId   = a.AppointmentId,
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    reason          = a.Reason,
                    status          = a.Status,
                    doctorNotes     = a.DoctorNotes,
                    noteType        = a.NoteType,
                    noteContent     = a.NoteContent
                })
                .ToList();

            var prescriptions = _context.Prescriptions
                .Where(p => p.DoctorId == doctorId && p.PatientId == patientId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    id           = p.Id,
                    diagnosis    = p.Diagnosis,
                    medicines    = p.Medicines,
                    instructions = p.Instructions,
                    createdAt    = p.CreatedAt
                })
                .ToList();

            return Ok(new
            {
                patientId     = patient.UserId,
                fullName      = patient.FullName,
                email         = patient.Email,
                phone         = patient.Phone,
                address       = patient.Address,
                appointments,
                prescriptions
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PRESCRIPTIONS

    // GET api/doctor/prescriptions
    [HttpGet("prescriptions")]
    public IActionResult GetPrescriptions()
    {
        try
        {
            var doctorId = GetCurrentUserId();

            var prescriptions = _context.Prescriptions
                .Where(p => p.DoctorId == doctorId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    id          = p.Id,
                    patientName = _context.Users
                                    .Where(u => u.UserId == p.PatientId)
                                    .Select(u => u.FullName)
                                    .FirstOrDefault(),
                    diagnosis    = p.Diagnosis,
                    medicines    = p.Medicines,
                    instructions = p.Instructions,
                    createdAt    = p.CreatedAt
                })
                .ToList();

            return Ok(prescriptions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // GET api/doctor/patients/{patientId}/documents
    [HttpGet("patients/{patientId}/documents")]
    public IActionResult GetPatientDocuments(Guid patientId)
    {
        try
        {
            var doctorId = GetCurrentUserId();

            var hasRelation = _context.Appointments
                .Any(a => a.DoctorId == doctorId && a.PatientId == patientId);

            if (!hasRelation)
                return NotFound(new { message = "Patient not found or access denied." });

            var docs = _context.Documents
                .Where(d => d.PatientId == patientId)
                .OrderByDescending(d => d.UploadDate)
                .Select(d => new
                {
                    id           = d.Id,
                    name         = d.FileName,
                    documentType = d.DocumentType,
                    fileSize     = d.FileSize,
                    url          = d.FileUrl,
                    uploadDate   = d.UploadDate.ToString("yyyy-MM-dd")
                })
                .ToList();

            return Ok(docs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // POST api/doctor/prescriptions
    [HttpPost("prescriptions")]
    public async Task<IActionResult> CreatePrescription(
        [FromBody] CreatePrescriptionRequest request)
    {
        try
        {
            var doctorId = GetCurrentUserId();

            // Verify appointment belongs to this doctor
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == request.AppointmentId
                                       && a.DoctorId == doctorId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            if (appointment.PatientId != request.PatientId)
                return BadRequest(new { message = "Prescription patient does not match the appointment patient." });

            if (appointment.Status == AppointmentStatus.Completed || appointment.Status == AppointmentStatus.Cancelled)
                return BadRequest(new { message = "Cannot create a prescription for a completed or cancelled appointment." });

            if (!DoctorAppointmentTimePolicy.HasStarted(appointment.AppointmentDate, appointment.AppointmentTime, DateTime.Now))
                return BadRequest(new { message = "Cannot create a prescription before the appointment time." });

            var prescription = new Prescription
            {
                AppointmentId = request.AppointmentId,
                DoctorId      = doctorId,
                PatientId     = request.PatientId,
                Diagnosis     = request.Diagnosis,
                Medicines     = request.Medicines,
                Instructions  = request.Instructions,
                CreatedAt     = DateTime.UtcNow
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            // AWS SNS — notify patient
            var patient = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.PatientId);
            var doctor  = await _context.Users.FirstOrDefaultAsync(u => u.UserId == doctorId);

            if (patient != null)
            {
                await _notification.SendNotificationAsync("New Prescription",
                    $"Hi {patient.FullName}, Dr. {doctor?.FullName} has issued a prescription for: {request.Diagnosis}. Log in to MediCare+ to view it.");
            }

            return Ok(new
            {
                message        = "Prescription created and patient notified.",
                prescriptionId = prescription.Id
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // PUT api/doctor/prescriptions/{id}
    [HttpPut("prescriptions/{id}")]
    public async Task<IActionResult> UpdatePrescription(Guid id, [FromBody] UpdatePrescriptionRequest request)
    {
        try
        {
            var doctorId = GetCurrentUserId();
            var prescription = await _context.Prescriptions
                .FirstOrDefaultAsync(p => p.Id == id && p.DoctorId == doctorId);

            if (prescription == null)
                return NotFound(new { message = "Prescription not found." });

            if (request.Diagnosis     != null) prescription.Diagnosis     = request.Diagnosis;
            if (request.Medicines     != null) prescription.Medicines     = request.Medicines;
            if (request.Instructions  != null) prescription.Instructions  = request.Instructions;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Prescription updated." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // POST api/doctor/patients/{patientId}/refer
    [HttpPost("patients/{patientId}/refer")]
    public async Task<IActionResult> ReferPatient(Guid patientId, [FromBody] ReferPatientRequest request)
    {
        try
        {
            var doctorId = GetCurrentUserId();

            var hasRelation = _context.Appointments
                .Any(a => a.DoctorId == doctorId && a.PatientId == patientId);

            if (!hasRelation)
                return NotFound(new { message = "Patient not found or access denied." });

            if (request.ToDoctorId == doctorId)
                return BadRequest(new { message = "You cannot refer a patient to yourself." });

            var referringDoctor = await _context.Users.FirstOrDefaultAsync(u => u.UserId == doctorId);
            var targetDoctor    = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.ToDoctorId && u.Role == "Doctor");
            var patient         = await _context.Users.FirstOrDefaultAsync(u => u.UserId == patientId);

            if (targetDoctor == null)
                return NotFound(new { message = "Target doctor not found." });

            if (!DoctorAppointmentTimePolicy.IsFutureOrCurrent(request.AppointmentDate, request.AppointmentTime, DateTime.Now))
                return BadRequest(new { message = "Referral appointment date and time cannot be in the past." });

            var referral = new Appointment
            {
                PatientId       = patientId,
                DoctorId        = request.ToDoctorId,
                AppointmentDate = request.AppointmentDate,
                AppointmentTime = request.AppointmentTime,
                Reason          = $"Referred by Dr. {referringDoctor?.FullName}: {request.Reason}",
                Status          = AppointmentStatus.Pending
            };

            _context.Appointments.Add(referral);

            // Auto-complete the most recent active appointment between this doctor and patient
            var sourceAppointment = await _context.Appointments
                .Where(a => a.DoctorId == doctorId
                         && a.PatientId == patientId
                         && (a.Status == AppointmentStatus.Pending || a.Status == AppointmentStatus.Confirmed))
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .FirstOrDefaultAsync();

            if (sourceAppointment != null)
                sourceAppointment.Status = AppointmentStatus.Completed;

            await _context.SaveChangesAsync();

            if (patient != null)
            {
                await _notification.SendNotificationAsync("Referral Notice",
                    $"Hi {patient.FullName}, Dr. {referringDoctor?.FullName} has referred you to Dr. {targetDoctor.FullName} on {request.AppointmentDate} at {request.AppointmentTime}. Please confirm via MediCare+.");
            }

            return Ok(new { message = $"Patient referred to Dr. {targetDoctor.FullName}. Appointment created.", appointmentId = referral.AppointmentId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }
}

// DTOs

public class UpdateDoctorProfileRequest
{
    public string? Specialization { get; set; }
    public string? LicenseNumber  { get; set; }
    public string? Department     { get; set; }
    public string? Phone          { get; set; }
    public bool?   IsAvailable    { get; set; }
    public string? AvailableDays  { get; set; }
    public string? AvailableFrom  { get; set; }
    public string? AvailableTo    { get; set; }
}

public class UpdateAppointmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateAppointmentNotesRequest
{
    public string? DoctorNotes  { get; set; }
    public string? NoteType     { get; set; }
    public string? NoteContent  { get; set; }
}

public class CreatePrescriptionRequest
{
    public Guid    AppointmentId { get; set; }
    public Guid    PatientId     { get; set; }
    public string  Diagnosis     { get; set; } = string.Empty;
    public string  Medicines     { get; set; } = string.Empty;
    public string? Instructions  { get; set; }
}

public class UpdatePrescriptionRequest
{
    public string? Diagnosis     { get; set; }
    public string? Medicines     { get; set; }
    public string? Instructions  { get; set; }
}

public class ReferPatientRequest
{
    public Guid     ToDoctorId      { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string   Reason          { get; set; } = string.Empty;
}
