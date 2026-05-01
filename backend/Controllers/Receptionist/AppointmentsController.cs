using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using backend.Services.AWS;
using System.Globalization;

namespace backend.Controllers;


[ApiController]
[Route("api/receptionist/appointments")]
public class ReceptionistAppointmentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notification;
    private readonly EventBridgeService _eventBridge;

    public ReceptionistAppointmentsController(
        ApplicationDbContext db,
        INotificationService notification,
        EventBridgeService eventBridge)
    {
        _db = db;
        _notification = notification;
        _eventBridge = eventBridge;
    }

    // GET /api/receptionist/appointments?date=2026-04-25
    [HttpGet]
    public IActionResult GetByDate([FromQuery] string? date)
    {
        var targetDate = DateOnly.TryParse(date, out var d) ? d : DateOnly.FromDateTime(DateTime.Today);

        var appointments = _db.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.AppointmentDate == targetDate)
            .OrderBy(a => a.AppointmentTime)
            .ToList()
            .Select(a => new
            {
                id          = a.AppointmentId,
                patientId   = a.PatientId,
                patientName = a.Patient?.FullName ?? "",
                icPassport  = a.Patient?.IcPassport ?? "",
                doctorName  = a.Doctor?.FullName ?? "",
                time        = a.AppointmentTime.ToString("hh:mm tt", CultureInfo.InvariantCulture),
                reason      = a.Reason ?? "",
                status      = FormatStatus(a.Status)
            })
            .ToList();

        return Ok(appointments);
    }

    // GET /api/receptionist/appointments/doctors
    [HttpGet("doctors")]
    public IActionResult GetDoctors()
    {
        var doctors = _db.Users
            .Where(u => u.Role == "Doctor")
            .Select(u => new { doctorId = u.UserId, fullName = u.FullName })
            .ToList();
        return Ok(doctors);
    }

    // POST /api/receptionist/appointments
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ReceptionistCreateApptRequest req)
    {
        try
        {
            if (!DateOnly.TryParse(req.Date, out var apptDate))
                return BadRequest(new { message = "Invalid date format." });

            // Use DateTime.TryParse which handles "09:30 AM" reliably
            if (!DateTime.TryParse(req.Time, out var dt))
                return BadRequest(new { message = "Invalid time format." });
            var apptTime = TimeOnly.FromDateTime(dt);

            var appt = new Appointment
            {
                PatientId       = req.PatientId,
                DoctorId        = req.DoctorId,
                AppointmentDate = apptDate,
                AppointmentTime = apptTime,
                Reason          = req.Reason,
                Status          = AppointmentStatus.Scheduled
            };

            _db.Appointments.Add(appt);
            await _db.SaveChangesAsync();

            var patient = await _db.Users.FindAsync(req.PatientId);
            var doctor  = await _db.Users.FindAsync(req.DoctorId);

            // EventBridge audit log
            await _eventBridge.PublishAuditAsync("ReceptionistAppointmentBooked", new {
                AppointmentId = appt.AppointmentId,
                PatientId     = req.PatientId,
                DoctorId      = req.DoctorId,
                Date          = apptDate,
                Time          = apptTime,
                Timestamp     = DateTime.UtcNow
            });

            // SNS notification to patient
            await _notification.SendNotificationAsync(
                "Appointment Booked by Receptionist",
                $"Dear {patient?.FullName ?? "Patient"}, an appointment has been scheduled for you with Dr. {doctor?.FullName ?? "your doctor"} on {apptDate:MMM dd, yyyy} at {apptTime:hh:mm tt}. Reason: {req.Reason ?? "General Consultation"}."
            );

            return Ok(new { message = "Appointment booked successfully.", appointmentId = appt.AppointmentId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to book appointment.", details = ex.Message });
        }
    }

    // PATCH /api/receptionist/appointments/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ReceptionistUpdateStatusRequest req)
    {
        var appt = await _db.Appointments
            .Include(a => a.Patient)
            .FirstOrDefaultAsync(a => a.AppointmentId == id);
        if (appt == null) return NotFound(new { message = "Appointment not found." });

        appt.Status = ParseStatus(req.Status);

        if (appt.Status == AppointmentStatus.CheckedIn)
            appt.CheckInTime = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // EventBridge audit log
        await _eventBridge.PublishAuditAsync("ReceptionistAppointmentStatusUpdated", new {
            AppointmentId = id,
            NewStatus     = req.Status,
            Timestamp     = DateTime.UtcNow
        });

        // SNS for meaningful status changes only
        if (appt.Status == AppointmentStatus.Confirmed || appt.Status == AppointmentStatus.Cancelled)
        {
            var statusMsg = appt.Status == AppointmentStatus.Confirmed
                ? $"Your appointment on {appt.AppointmentDate:MMM dd, yyyy} at {appt.AppointmentTime:hh:mm tt} has been confirmed."
                : $"Your appointment on {appt.AppointmentDate:MMM dd, yyyy} at {appt.AppointmentTime:hh:mm tt} has been cancelled by the receptionist.";

            await _notification.SendNotificationAsync(
                $"Appointment {req.Status}",
                $"Dear {appt.Patient?.FullName ?? "Patient"}, {statusMsg}"
            );
        }

        return Ok(new { message = "Status updated." });
    }

    // POST /api/receptionist/appointments/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteWithBilling(Guid id)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound(new { message = "Appointment not found." });

        if (appt.Status == AppointmentStatus.Completed)
        {
            var existing = await _db.Invoices.FirstOrDefaultAsync(i => i.AppointmentId == id);
            if (existing != null)
                return Ok(new { message = "Already completed.", invoiceId = existing.InvoiceId });
        }

        appt.Status = AppointmentStatus.Completed;

        var invoice = new Invoice
        {
            PatientId     = appt.PatientId,
            AppointmentId = appt.AppointmentId,
            Status        = InvoiceStatus.Pending,
            TotalAmount   = 0,
            CreatedAt     = DateTime.UtcNow
        };
        invoice.Items = new List<InvoiceItem>
        {
            new InvoiceItem
            {
                InvoiceId   = invoice.InvoiceId,
                Description = "Consultation Fee",
                Quantity    = 1,
                UnitPrice   = 0,
                Amount      = 0
            }
        };

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        var patient = await _db.Users.FindAsync(appt.PatientId);

        // EventBridge audit log
        await _eventBridge.PublishAuditAsync("ReceptionistAppointmentCompleted", new {
            AppointmentId = id,
            InvoiceId     = invoice.InvoiceId,
            PatientId     = appt.PatientId,
            Timestamp     = DateTime.UtcNow
        });

        // SNS notification
        await _notification.SendNotificationAsync(
            "Appointment Completed – Invoice Pending",
            $"Dear {patient?.FullName ?? "Patient"}, your appointment on {appt.AppointmentDate:MMM dd, yyyy} has been completed. An invoice has been generated and is pending payment. Please proceed to the counter."
        );

        return Ok(new { message = "Appointment completed and billing record created.", invoiceId = invoice.InvoiceId });
    }

    // PATCH /api/receptionist/appointments/{id}/reschedule
    [HttpPatch("{id}/reschedule")]
    public async Task<IActionResult> Reschedule(Guid id, [FromBody] RescheduleRequest req)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound(new { message = "Appointment not found." });

        if (DateOnly.TryParse(req.Date, out var newDate))
            appt.AppointmentDate = newDate;

        if (DateTime.TryParse(req.Time, out var dt))
            appt.AppointmentTime = TimeOnly.FromDateTime(dt);

        appt.Status = AppointmentStatus.Scheduled;
        await _db.SaveChangesAsync();

        var patient = await _db.Users.FindAsync(appt.PatientId);

        // EventBridge audit log
        await _eventBridge.PublishAuditAsync("ReceptionistAppointmentRescheduled", new {
            AppointmentId = id,
            NewDate       = appt.AppointmentDate,
            NewTime       = appt.AppointmentTime,
            Timestamp     = DateTime.UtcNow
        });

        // SNS notification
        await _notification.SendNotificationAsync(
            "Appointment Rescheduled",
            $"Dear {patient?.FullName ?? "Patient"}, your appointment has been rescheduled to {appt.AppointmentDate:MMM dd, yyyy} at {appt.AppointmentTime:hh:mm tt}."
        );

        return Ok(new { message = "Appointment rescheduled." });
    }

    private static string FormatStatus(AppointmentStatus s) => s switch
    {
        AppointmentStatus.CheckedIn      => "Checked-In",
        AppointmentStatus.InConsultation => "In Consultation",
        _ => s.ToString()
    };

    private static AppointmentStatus ParseStatus(string s) => s switch
    {
        "Checked-In"      => AppointmentStatus.CheckedIn,
        "In Consultation" => AppointmentStatus.InConsultation,
        "Confirmed"       => AppointmentStatus.Confirmed,
        "Completed"       => AppointmentStatus.Completed,
        "Cancelled"       => AppointmentStatus.Cancelled,
        "Scheduled"       => AppointmentStatus.Scheduled,
        _                 => AppointmentStatus.Pending
    };
}

public class ReceptionistCreateApptRequest
{
    public Guid    PatientId { get; set; }
    public Guid    DoctorId  { get; set; }
    public string  Date      { get; set; } = string.Empty;
    public string  Time      { get; set; } = string.Empty;
    public string? Reason    { get; set; }
}

public class ReceptionistUpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class RescheduleRequest
{
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
}
