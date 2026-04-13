using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context; 
    private readonly IConfiguration _config; 
    private readonly IMessageQueue _queue;
    
    public AppointmentController(ApplicationDbContext context, IConfiguration config, IMessageQueue queue)
    {
        _context = context;
        _config = config;
        _queue = queue;

    }

    // GET: api/appointment/doctors
    [HttpGet("doctors")]
    public IActionResult GetAvailableDoctors()
    {
        var doctors = _context.Users
            .Where(u => u.Role == "Doctor")
            .Select(u => new 
            { 
                doctorId = u.UserId, 
                fullName = u.FullName 
            })
            .ToList();

        return Ok(doctors);
    }

    // POST: api/appointment/book
    [Authorize] 
    [HttpPost("book")]
    public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentRequest request) // Added async Task
    {
        try 
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { message = "You must be logged in to book an appointment." });
            }

            var patientId = Guid.Parse(userIdString);

            var newAppointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                AppointmentTime = request.AppointmentTime,
                Reason = request.Reason,
                Status = AppointmentStatus.Pending // Uses your new Enum!
            };

            // 1. Save to Database
            _context.Appointments.Add(newAppointment);
            await _context.SaveChangesAsync(); // Use Async version

            // 2. CLOUD LOGIC: Add notification task to SQS Queue
            // This represents "Asynchronous Processing" in your DDAC report
            var notificationPayload = new {
                PatientId = patientId,
                Message = $"Appointment confirmed for {request.AppointmentDate} at {request.AppointmentTime}",
                TargetPhone = "012-3456789" // In real life, you'd pull this from User data
            };

            await _queue.AddToQueueAsync("appointment-notifications", notificationPayload);

            return Ok(new { 
                message = "Appointment booked and notification queued!", 
                appointmentId = newAppointment.AppointmentId 
            });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("mine")]
    public IActionResult GetMyAppointments()
    {
        try 
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var patientId = Guid.Parse(userIdString);

            // We use .Select() to neatly package the data and grab the Doctor's real name!
            var appointments = _context.Appointments
                .Where(a => a.PatientId == patientId)
                .OrderBy(a => a.AppointmentDate)         // Sort first!
                .ThenBy(a => a.AppointmentTime)
                .Select(a => new
                {
                    appointmentId = a.AppointmentId,
                    doctorName = _context.Users.Where(u => u.UserId == a.DoctorId).Select(u => u.FullName).FirstOrDefault(),
                    appointmentDate = a.AppointmentDate,
                    appointmentTime = a.AppointmentTime,
                    reason = a.Reason,
                    status = a.Status,
                    doctorNotes = a.DoctorNotes,
                    prescription = a.Prescription,
                })
                .ToList();

            return Ok(appointments);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch appointments", details = ex.Message });
        }
    }

[Authorize]
[HttpPatch("{id}/cancel")] // URL: api/appointment/{id}/cancel
public async Task<IActionResult> CancelAppointment(Guid id)
{
    try
    {
        var userIdString = User.FindFirst("userId")?.Value;
        var patientId = Guid.Parse(userIdString);

        // 1. Find the appointment and make sure it belongs to THIS user
        var appointment = await _context.Appointments
            .FirstOrDefaultAsync(a => a.AppointmentId == id && a.PatientId == patientId);

        if (appointment == null)
        {
            return NotFound(new { message = "Appointment not found or you don't have permission to cancel it." });
        }

        // 2. Change the status using your Enum
        appointment.Status = AppointmentStatus.Cancelled;
        
        await _context.SaveChangesAsync();

        // 3. (Optional) Tell SQS to notify the clinic that a patient cancelled
        await _queue.AddToQueueAsync("appointment-notifications", new {
            Action = "CANCELLED",
            AppointmentId = id,
            Message = $"Patient cancelled appointment for {appointment.AppointmentDate}"
        });

        return Ok(new { message = "Appointment cancelled successfully." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error cancelling appointment", details = ex.Message });
    }
}
}

// --------------------------------------------------------
// The Blueprint (DTO) for incoming Next.js data.
// --------------------------------------------------------
public class BookAppointmentRequest
{
    public Guid DoctorId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string Reason { get; set; }
}
