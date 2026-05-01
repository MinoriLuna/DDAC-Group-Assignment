using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services.Interfaces;
using backend.Services.AWS;

namespace backend.Controllers;

[ApiController]
[Route("api/receptionist/invoices")]
public class ReceptionistInvoicesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly INotificationService _notification;
    private readonly EventBridgeService _eventBridge;

    public ReceptionistInvoicesController(
        ApplicationDbContext db,
        INotificationService notification,
        EventBridgeService eventBridge)
    {
        _db = db;
        _notification = notification;
        _eventBridge = eventBridge;
    }

    // GET /api/receptionist/invoices
    [HttpGet]
    public IActionResult GetAll()
    {
        var invoices = _db.Invoices
            .Include(i => i.Patient)
            .Include(i => i.Items)
            .Include(i => i.Appointment).ThenInclude(a => a!.Doctor)
            .OrderByDescending(i => i.CreatedAt)
            .ToList()
            .Select(i => new
            {
                invoiceId     = i.InvoiceId,
                patientName   = i.Patient?.FullName ?? "",
                totalAmount   = i.TotalAmount,
                status        = i.Status.ToString(),
                createdAt     = i.CreatedAt,
                paidAt        = i.PaidAt,
                paymentMethod = i.PaymentMethod,
                appointment   = i.Appointment == null ? null : (object)new
                {
                    date       = i.Appointment.AppointmentDate.ToString("MMM dd, yyyy"),
                    time       = i.Appointment.AppointmentTime.ToString("hh:mm tt"),
                    reason     = i.Appointment.Reason ?? "",
                    doctorName = i.Appointment.Doctor?.FullName ?? ""
                },
                items = i.Items.Select(x => new
                {
                    description = x.Description,
                    quantity    = x.Quantity,
                    unitPrice   = x.UnitPrice,
                    amount      = x.Amount
                }).ToList()
            })
            .ToList();

        return Ok(invoices);
    }

    // POST /api/receptionist/invoices
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceRequest req)
    {
        if (req.Items == null || req.Items.Count == 0)
            return BadRequest(new { message = "Invoice must have at least one item." });

        if (req.PatientId == Guid.Empty)
            return BadRequest(new { message = "A valid patient ID is required." });

        try
        {
            var invoice = new Invoice
            {
                PatientId     = req.PatientId,
                AppointmentId = req.AppointmentId,
                Status        = InvoiceStatus.Pending,
                CreatedAt     = DateTime.UtcNow
            };

            var items = req.Items.Select(i =>
            {
                var qty       = i.Quantity > 0 ? i.Quantity : 1;
                var unitPrice = i.UnitPrice > 0 ? i.UnitPrice : i.Amount;
                var amount    = i.Amount > 0 ? i.Amount : qty * unitPrice;

                return new InvoiceItem
                {
                    InvoiceId   = invoice.InvoiceId,
                    Description = i.Description,
                    Quantity    = qty,
                    UnitPrice   = unitPrice,
                    Amount      = amount
                };
            }).ToList();

            invoice.TotalAmount = items.Sum(i => i.Amount);
            invoice.Items = items;

            _db.Invoices.Add(invoice);
            await _db.SaveChangesAsync();

            // EventBridge audit log
            await _eventBridge.PublishAuditAsync("ReceptionistInvoiceCreated", new {
                InvoiceId   = invoice.InvoiceId,
                PatientId   = req.PatientId,
                TotalAmount = invoice.TotalAmount,
                Timestamp   = DateTime.UtcNow
            });

            return Ok(new { message = "Invoice created.", invoiceId = invoice.InvoiceId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create invoice.", details = ex.InnerException?.Message ?? ex.Message });
        }
    }

    // PUT /api/receptionist/invoices/{id}/items
    [HttpPut("{id}/items")]
    public async Task<IActionResult> UpdateItems(Guid id, [FromBody] UpdateInvoiceItemsRequest req)
    {
        if (req.Items == null || req.Items.Count == 0)
            return BadRequest(new { message = "Invoice must have at least one item." });

        var invoice = await _db.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);

        if (invoice == null) return NotFound(new { message = "Invoice not found." });
        if (invoice.Status == InvoiceStatus.Paid) return BadRequest(new { message = "Cannot edit a paid invoice." });

        _db.InvoiceItems.RemoveRange(invoice.Items.ToList());

        var newItems = req.Items.Select(i =>
        {
            var qty    = i.Quantity > 0 ? i.Quantity : 1;
            var amount = qty * i.UnitPrice;
            return new InvoiceItem
            {
                InvoiceId   = invoice.InvoiceId,
                Description = i.Description,
                Quantity    = qty,
                UnitPrice   = i.UnitPrice,
                Amount      = amount
            };
        }).ToList();

        invoice.TotalAmount = newItems.Sum(i => i.Amount);
        _db.InvoiceItems.AddRange(newItems);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Invoice updated.", totalAmount = invoice.TotalAmount });
    }

    // PATCH /api/receptionist/invoices/{id}/pay
    [HttpPatch("{id}/pay")]
    public async Task<IActionResult> Pay(Guid id, [FromBody] PayInvoiceRequest req)
    {
        var invoice = await _db.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.InvoiceId == id);
        if (invoice == null) return NotFound(new { message = "Invoice not found." });

        if (req.Amount.HasValue && req.Amount.Value > 0)
        {
            invoice.TotalAmount = req.Amount.Value;
            // Update the single placeholder item to match the confirmed amount
            var placeholder = invoice.Items.FirstOrDefault(x => x.Description == "Consultation Fee");
            if (placeholder != null)
            {
                placeholder.UnitPrice = req.Amount.Value;
                placeholder.Amount    = req.Amount.Value;
            }
        }

        invoice.Status        = InvoiceStatus.Paid;
        invoice.PaymentMethod = req.PaymentMethod;
        invoice.PaidAt        = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var patient = await _db.Users.FindAsync(invoice.PatientId);

        // EventBridge audit log
        await _eventBridge.PublishAuditAsync("ReceptionistInvoicePaid", new {
            InvoiceId     = id,
            PatientId     = invoice.PatientId,
            TotalAmount   = invoice.TotalAmount,
            PaymentMethod = req.PaymentMethod,
            Timestamp     = DateTime.UtcNow
        });

        // SNS notification
        await _notification.SendNotificationAsync(
            "Payment Received – Invoice Settled",
            $"Dear {patient?.FullName ?? "Patient"}, your payment of RM {invoice.TotalAmount:F2} via {req.PaymentMethod} has been received. Your invoice is now fully settled. Thank you!"
        );

        return Ok(new { message = "Payment recorded successfully." });
    }
}

public class CreateInvoiceRequest
{
    public Guid                   PatientId     { get; set; }
    public Guid?                  AppointmentId { get; set; }
    public List<InvoiceItemRequest> Items       { get; set; } = new();
}

public class InvoiceItemRequest
{
    public string  Description { get; set; } = string.Empty;
    public int     Quantity    { get; set; } = 1;
    public decimal UnitPrice   { get; set; }
    public decimal Amount      { get; set; }
}

public class PayInvoiceRequest
{
    public string   PaymentMethod { get; set; } = string.Empty;
    public decimal? Amount        { get; set; }
}

public class UpdateInvoiceItemsRequest
{
    public List<InvoiceItemRequest> Items { get; set; } = new();
}
