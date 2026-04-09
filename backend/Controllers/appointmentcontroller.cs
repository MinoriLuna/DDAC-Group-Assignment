using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context; 
    private readonly IConfiguration _config; 

    public AppointmentController(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
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
    public IActionResult BookAppointment([FromBody] BookAppointmentRequest request)
    {
        try 
        {
            // 1. Find out who is asking using their JWT passport
            var userIdString = User.FindFirst("userId")?.Value;
            
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized(new { message = "You must be logged in to book an appointment." });
            }

            var patientId = Guid.Parse(userIdString);

            // 2. Build the new appointment using the data Next.js sent us
            var newAppointment = new Appointment
            {
                PatientId = patientId,
                DoctorId = request.DoctorId,
                AppointmentDate = request.AppointmentDate,
                AppointmentTime = request.AppointmentTime,
                Reason = request.Reason
            };

            // 3. Save to database
            _context.Appointments.Add(newAppointment);
            _context.SaveChanges();

            // 4. Tell Next.js it worked!
            return Ok(new { message = "Appointment booked successfully!", appointmentId = newAppointment.AppointmentId });
        }
        catch (System.Exception ex)
        {
            // If the database crashes (e.g. missing foreign key), send the exact error back to the frontend
            return StatusCode(500, new { message = "Database Error", details = ex.InnerException?.Message ?? ex.Message });
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