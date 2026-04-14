using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using Npgsql;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context; 
    private readonly IConfiguration _config; 
    private readonly IMessageQueue _queue;
    private readonly INotificationService _notification;
    
    public AppointmentController(ApplicationDbContext context, IConfiguration config, IMessageQueue queue, INotificationService notification)
    {
        _context = context;
        _config = config;
        _queue = queue;
        _notification = notification;

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
    public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentRequest request)
    {
        try 
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized(new { message = "You must be logged in." });

            var patientId = Guid.Parse(userIdString);

            var newAppointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                AppointmentTime = request.AppointmentTime,
                Reason = request.Reason,
                Status = AppointmentStatus.Pending 
            };

            _context.Appointments.Add(newAppointment);
            await _context.SaveChangesAsync(); 

            // --- CLOUD LOGIC A: SQS (The Queue) ---
            var notificationPayload = new {
                PatientId = patientId,
                Message = $"Appointment confirmed for {request.AppointmentDate}",
                TargetPhone = "012-3456789" 
            };
            await _queue.AddToQueueAsync("appointment-notifications", notificationPayload);

            // --- CLOUD LOGIC B: SNS (The Real-time SMS) ---
            // In a real app, you'd fetch the user's real phone from the DB first
            string msg = $"Booking Confirmed! See you on {request.AppointmentDate} at {request.AppointmentTime}.";
            await _notification.SendSmsAsync("+60123456789", msg); //Fake one rn

            return Ok(new { 
                message = "Appointment booked and SMS notification sent!", 
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
    [HttpPatch("{id}/cancel")] 
    public async Task<IActionResult> CancelAppointment(Guid id)
    {
        try
        {
            var userIdString = User.FindFirst("userId")?.Value;
            var patientId = Guid.Parse(userIdString);

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == id && a.PatientId == patientId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.Status = AppointmentStatus.Cancelled;
            await _context.SaveChangesAsync();

            // Cloud Feature A
            // Notify via Queue
            await _queue.AddToQueueAsync("appointment-notifications", new {
                Action = "CANCELLED",
                AppointmentId = id
            });

            // Cloud Feature B
            // Notify via SMS (Mock/SNS)
            await _notification.SendSmsAsync("+60123456789", $"Your appointment on {appointment.AppointmentDate} has been cancelled.");

            return Ok(new { message = "Appointment cancelled successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error", details = ex.Message });
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
