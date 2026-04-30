using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using backend.Services.AWS; 

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context; 
    private readonly IConfiguration _config; 
    private readonly INotificationService _notification; // Existing SNS Service
    private readonly EventBridgeService _eventBridge;     // Existing Audit Service
    private readonly ISqsService _sqs;                   // New SQS/SES Service

    public AppointmentController(
        ApplicationDbContext context, 
        IConfiguration config, 
        INotificationService notification,
        EventBridgeService eventBridge,
        ISqsService sqs) 
    {
        _context = context;
        _config = config;
        _notification = notification;
        _eventBridge = eventBridge;
        _sqs = sqs;
    }

    // --- 1. DOCTOR RETRIEVAL ---
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

    // --- 2. BOOKING LOGIC ---
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
            var patient = await _context.Users.FindAsync(patientId);

            var newAppointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                AppointmentTime = request.AppointmentTime,
                Reason = request.Reason ?? "Regular Checkup", 
                Status = AppointmentStatus.Pending 
            };

            _context.Appointments.Add(newAppointment);
            await _context.SaveChangesAsync(); 

<<<<<<< HEAD
            var patient = await _context.Users.FirstOrDefaultAsync(u => u.UserId == patientId);
            var doctor  = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.DoctorId);

            // --- CLOUD LOGIC A: SQS (The Queue) ---
            await _queue.AddToQueueAsync("appointment-notifications", new {
                PatientId = patientId,
                Message = $"Appointment confirmed for {request.AppointmentDate}",
                TargetPhone = patient?.Phone ?? ""
            });

            // --- CLOUD LOGIC B: SNS (The Real-time SMS) ---
            if (patient != null && !string.IsNullOrEmpty(patient.Phone))
            {
                string msg = $"Hi {patient.FullName}, your appointment with Dr. {doctor?.FullName} is confirmed for {request.AppointmentDate} at {request.AppointmentTime}. See you soon!";
                await _notification.SendSmsAsync(patient.Phone, msg);
            }
=======
            // --- CLOUD ARCHITECTURE MULTI-SEND ---

            // A. EventBridge: Permanent Audit Log for compliance
            await _eventBridge.PublishAuditAsync("AppointmentBooked", new {
                AppointmentId = newAppointment.AppointmentId,
                PatientId = patientId,
                DoctorId = request.DoctorId,
                Date = request.AppointmentDate,
                Timestamp = DateTime.UtcNow
            });

            // B. SNS: Immediate Admin/Group Notification (The "Radio" Broadcast)
            await _notification.SendNotificationAsync(
                "New Appointment Booking", 
                $"New booking for {request.AppointmentDate} at {request.AppointmentTime}. User: {patient?.FullName}"
            );

            // C. SQS -> SES: Pretty Patient Email (The "Microservice" Add-on)
            await _sqs.EnqueueEmailAsync(
                patient?.Email ?? "",
                patient?.FullName ?? "Patient",
                "Confirmed",
                $"Your appointment booking for {request.AppointmentDate} at {request.AppointmentTime} is pending doctor approval."
            );
>>>>>>> 1fa0b7a92fddee2177a0577c560d08aab5a0bc4e

            return Ok(new { 
                message = "Appointment booked and all cloud notifications initiated!", 
                appointmentId = newAppointment.AppointmentId 
            });
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, new { message = "Server Error", details = ex.Message });
        }
    }

    // --- 3. PATIENT APPOINTMENT LIST ---
    [Authorize]
    [HttpGet("mine")]
    public IActionResult GetMyAppointments()
    {
        try 
        {
            var userIdString = User.FindFirst("userId")?.Value ?? Guid.Empty.ToString();
            var patientId = Guid.Parse(userIdString);

            var appointments = _context.Appointments
                .Where(a => a.PatientId == patientId)
                .OrderBy(a => a.AppointmentDate)
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

    // --- 4. CANCELLATION LOGIC ---
    [Authorize]
    [HttpPatch("{id}/cancel")] 
    public async Task<IActionResult> CancelAppointment(Guid id)
    {
        try
        {
            var userIdString = User.FindFirst("userId")?.Value ?? Guid.Empty.ToString();
            var patientId = Guid.Parse(userIdString);
            var patient = await _context.Users.FindAsync(patientId);

            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentId == id && a.PatientId == patientId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            appointment.Status = AppointmentStatus.Cancelled;
            await _context.SaveChangesAsync();

            // --- CLOUD ARCHITECTURE CANCELLATION SYNC ---

            // A. EventBridge Audit
            await _eventBridge.PublishAuditAsync("AppointmentCancelled", new {
                Action = "CANCELLED",
                AppointmentId = id,
                PatientId = patientId,
                Timestamp = DateTime.UtcNow
            });

            // B. SNS Notification (Admin alert)
            await _notification.SendNotificationAsync(
                "Appointment Cancelled", 
                $"The appointment for {patient?.FullName} on {appointment.AppointmentDate} has been cancelled."
            );

            // C. SQS -> SES (Pretty Patient Notification)
            await _sqs.EnqueueEmailAsync(
                patient?.Email ?? "",
                patient?.FullName ?? "Patient",
                "Cancelled",
                $"Your appointment scheduled for {appointment.AppointmentDate} has been successfully cancelled."
            );

            return Ok(new { message = "Appointment cancelled and notifications sent." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error", details = ex.Message });
        }
    }
}

// Request DTO
public class BookAppointmentRequest
{
    public Guid DoctorId { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly AppointmentTime { get; set; }
    public string Reason { get; set; } = string.Empty;
}