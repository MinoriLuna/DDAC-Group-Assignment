using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.AWS;
using backend.Services.Interfaces;

namespace backend.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ComprehendService _comprehend;
    private readonly INotificationService _notification;

    public AdminController(ApplicationDbContext context, ComprehendService comprehend, INotificationService notification)
    {
        _context = context;
        _comprehend = comprehend;
        _notification = notification;
    }

    // GET: api/admin/stats
    [HttpGet("stats")]
    public IActionResult GetDashboardStats()
    {
        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var totalPatients = _context.Users.Count(u => u.Role == "Patient");
            var totalDoctors  = _context.Users.Count(u => u.Role == "Doctor");

            var pendingAppointments = _context.Appointments
                .Count(a => a.Status == AppointmentStatus.Pending);

            var todaysAppointments = _context.Appointments
                .Count(a => a.AppointmentDate == today);

            var recentAppointments = _context.Appointments
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .Select(a => new
                {
                    appointmentId   = a.AppointmentId,
                    patientName     = _context.Users.Where(u => u.UserId == a.PatientId).Select(u => u.FullName).FirstOrDefault(),
                    doctorName      = _context.Users.Where(u => u.UserId == a.DoctorId).Select(u => u.FullName).FirstOrDefault(),
                    appointmentDate = a.AppointmentDate,
                    reason          = a.Reason,
                    status          = a.Status.ToString()
                })
                .ToList();

            return Ok(new { totalPatients, totalDoctors, pendingAppointments, todaysAppointments, recentAppointments });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to load stats", details = ex.Message });
        }
    }

    // GET: api/admin/appointments
    [HttpGet("appointments")]
    public IActionResult GetAllAppointments()
    {
        try
        {
            var appointments = _context.Appointments
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .Select(a => new
                {
                    appointmentId   = a.AppointmentId,
                    patientName     = _context.Users.Where(u => u.UserId == a.PatientId).Select(u => u.FullName).FirstOrDefault(),
                    doctorName      = _context.Users.Where(u => u.UserId == a.DoctorId).Select(u => u.FullName).FirstOrDefault(),
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    reason          = a.Reason,
                    status          = a.Status.ToString()
                })
                .ToList();

            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to load appointments", details = ex.Message });
        }
    }

    // PATCH: api/admin/appointments/{id}/status
    [HttpPatch("appointments/{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            if (!Enum.TryParse<AppointmentStatus>(request.Status, out var newStatus))
                return BadRequest(new { message = "Invalid status value." });

            appointment.Status = newStatus;
            await _context.SaveChangesAsync();

            // Send SNS email notification on Confirmed or Cancelled
            if (newStatus == AppointmentStatus.Confirmed || newStatus == AppointmentStatus.Cancelled)
            {
                var patient = await _context.Users.FindAsync(appointment.PatientId);
                var doctor  = await _context.Users.FindAsync(appointment.DoctorId);

                var subject = newStatus == AppointmentStatus.Confirmed
                    ? "Appointment Confirmed – MediCare+"
                    : "Appointment Cancelled – MediCare+";

                var message = newStatus == AppointmentStatus.Confirmed
                    ? $"Dear {patient?.FullName} and Dr. {doctor?.FullName},\n\n" +
                      $"Your appointment on {appointment.AppointmentDate} at {appointment.AppointmentTime} has been CONFIRMED by the clinic admin.\n\n" +
                      $"Reason: {appointment.Reason ?? "N/A"}\n\n" +
                      "Please arrive 10 minutes before your scheduled time.\n\nThank you,\nMediCare+ Clinic"
                    : $"Dear {patient?.FullName} and Dr. {doctor?.FullName},\n\n" +
                      $"Your appointment on {appointment.AppointmentDate} at {appointment.AppointmentTime} has been CANCELLED by the clinic admin.\n\n" +
                      $"Reason: {appointment.Reason ?? "N/A"}\n\n" +
                      "Please contact the clinic to reschedule.\n\nThank you,\nMediCare+ Clinic";

                await _notification.SendNotificationAsync(subject, message);
            }

            return Ok(new { message = "Status updated.", status = newStatus.ToString() });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update status", details = ex.Message });
        }
    }

    // GET: api/admin/patients
    [HttpGet("patients")]
    public IActionResult GetAllPatients()
    {
        try
        {
            var patients = _context.Users
                .Where(u => u.Role == "Patient")
                .OrderBy(u => u.FullName)
                .Select(u => new
                {
                    userId            = u.UserId,
                    fullName          = u.FullName,
                    email             = u.Email,
                    phone             = u.Phone,
                    address           = u.Address,
                    joinedAt          = u.CreatedAt.ToString("yyyy-MM-dd"),
                    totalAppointments = _context.Appointments.Count(a => a.PatientId == u.UserId),
                    lastAppointment   = _context.Appointments
                        .Where(a => a.PatientId == u.UserId)
                        .OrderByDescending(a => a.AppointmentDate)
                        .Select(a => a.AppointmentDate.ToString())
                        .FirstOrDefault()
                })
                .ToList();

            return Ok(patients);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to load patients", details = ex.Message });
        }
    }

    // GET: api/admin/feedback
    [HttpGet("feedback")]
    public async Task<IActionResult> GetPatientFeedback()
    {
        try
        {
            var reviews = _context.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id          = r.Id,
                    patientName = _context.Users.Where(u => u.UserId == r.PatientId).Select(u => u.FullName).FirstOrDefault(),
                    doctorName  = _context.Users.Where(u => u.UserId == r.DoctorId).Select(u => u.FullName).FirstOrDefault(),
                    rating      = r.Rating,
                    comment     = r.Comment,
                    createdAt   = r.CreatedAt.ToString("yyyy-MM-dd")
                })
                .ToList();

            // Run Comprehend sentiment analysis on each comment
            var results = new List<object>();
            foreach (var r in reviews)
            {
                var sentiment = string.IsNullOrWhiteSpace(r.comment)
                    ? "NEUTRAL"
                    : await _comprehend.DetectSentimentAsync(r.comment);

                results.Add(new
                {
                    r.id,
                    r.patientName,
                    r.doctorName,
                    r.rating,
                    r.comment,
                    r.createdAt,
                    sentiment
                });
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to load feedback", details = ex.Message });
        }
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
