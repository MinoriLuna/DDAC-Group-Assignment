using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers.Admin;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
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

}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
