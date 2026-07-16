using AutoMapper;
using CustomerManagement.Api.DTOs;
using CustomerManagement.Domain.Models;
using CustomerManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PaymentController> _logger;
        private readonly IMapper _mapper;

        public PaymentController(AppDbContext context, ILogger<PaymentController> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        /// Returns all payments with resolved client and daily entry information
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPayments()
        {
            try
            {
                var payments = await _context.Payments
                    .Include(p => p.Client).ThenInclude(c => c.Location)
                    .Include(p => p.DailyEntry).ThenInclude(d => d.Location)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<PaymentDto>>(payments));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all payments");
                return StatusCode(500, "Unexpected error occurred while retrieving payments.");
            }
        }

        /// Returns a single payment by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            try
            {
                var payment = await _context.Payments
                    .Include(p => p.Client).ThenInclude(c => c.Location)
                    .Include(p => p.DailyEntry).ThenInclude(d => d.Location)
                    .FirstOrDefaultAsync(p => p.PaymentId == id);

                if (payment == null)
                    return NotFound();

                return Ok(_mapper.Map<PaymentDto>(payment));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching payment ID {PaymentId}", id);
                return StatusCode(500, "Unexpected error occurred while retrieving the payment.");
            }
        }

        /// Returns all payments linked to a specific client
        [HttpGet("client/{clientId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetByClient(int clientId)
        {
            try
            {
                var payments = await _context.Payments
                    .Where(p => p.ClientId == clientId)
                    .Include(p => p.Client).ThenInclude(c => c.Location)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<PaymentDto>>(payments));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching payments for client ID {ClientId}", clientId);
                return StatusCode(500, "Unexpected error occurred while retrieving payments by client.");
            }
        }

        /// Returns all payments linked to a specific daily entry
        [HttpGet("dailyEntry/{dailyEntryId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetByDailyEntry(int dailyEntryId)
        {
            try
            {
                var payments = await _context.Payments
                    .Where(p => p.DailyEntryId == dailyEntryId)
                    .Include(p => p.DailyEntry).ThenInclude(d => d.Location)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<PaymentDto>>(payments));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching payments for daily entry ID {DailyEntryId}", dailyEntryId);
                return StatusCode(500, "Unexpected error occurred while retrieving payments by daily entry.");
            }
        }

        /// Creates a new payment linked to either a Client or a DailyEntry.
        /// Returns 409 Conflict if a payment already exists for the same client or daily entry.
        [HttpPost]
        public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            try
            {
                bool hasClient = dto.ClientId.HasValue;
                bool hasDaily = dto.DailyEntryId.HasValue;

                if (hasClient == hasDaily)
                    return BadRequest("Payment must be associated with either a Client OR a DailyEntry.");

                // --- Duplicate check for client-linked payments ---
                if (hasClient)
                {
                    var client = await _context.Clients
                        .Include(c => c.Location)
                        .FirstOrDefaultAsync(c => c.ClientId == dto.ClientId);

                    if (client == null)
                        return BadRequest("Invalid ClientId");

                    var duplicatePayments = await _context.Payments
                        .Include(p => p.Client).ThenInclude(c => c.Location)
                        .Where(p => p.ClientId == dto.ClientId)
                        .ToListAsync();

                    if (duplicatePayments.Any())
                    {
                        return Conflict(new
                        {
                            status = "duplicate",
                            reason = "Payment already exists for this client",
                            matches = _mapper.Map<IEnumerable<PaymentDto>>(duplicatePayments),
                            locationKey = client.Location?.Key.ToLower()
                        });
                    }
                }

                // --- Duplicate check for daily entry-linked payments ---
                if (hasDaily)
                {
                    var daily = await _context.DailyEntries
                        .Include(d => d.Location)
                        .FirstOrDefaultAsync(d => d.DailyEntryId == dto.DailyEntryId);

                    if (daily == null)
                        return BadRequest("Invalid DailyEntryId");

                    var duplicatePayments = await _context.Payments
                        .Include(p => p.DailyEntry).ThenInclude(d => d.Location)
                        .Where(p => p.DailyEntryId == dto.DailyEntryId)
                        .ToListAsync();

                    if (duplicatePayments.Any())
                    {
                        return Conflict(new
                        {
                            status = "duplicate",
                            reason = "Payment already exists for this daily entry",
                            matches = _mapper.Map<IEnumerable<PaymentDto>>(duplicatePayments),
                            locationKey = daily.Location?.Key.ToLower()
                        });
                    }
                }

                // No duplicates found - create the payment
                var payment = _mapper.Map<Payment>(dto);
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Reload with related data for the response
                var result = await _context.Payments
                    .Include(p => p.Client).ThenInclude(c => c.Location)
                    .Include(p => p.DailyEntry).ThenInclude(d => d.Location)
                    .FirstOrDefaultAsync(p => p.PaymentId == payment.PaymentId);

                _logger.LogInformation("Payment created successfully: {PaymentId}", payment.PaymentId);

                return CreatedAtAction(nameof(GetPayment),
                    new { id = payment.PaymentId },
                    _mapper.Map<PaymentDto>(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, "Unexpected error occurred while creating the payment.");
            }
        }

        /// Updates an existing payment's amount, date and invoice number.
        /// ClientId and DailyEntryId cannot be changed - payment ownership is immutable.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdatePaymentDto dto)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment == null)
                    return NotFound();

                _mapper.Map(dto, payment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment ID {PaymentId}", id);
                return StatusCode(500, "Unexpected error occurred while updating the payment.");
            }
        }

        /// Deletes a payment by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(id);
                if (payment == null)
                    return NotFound();

                _context.Payments.Remove(payment);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting payment ID {PaymentId}", id);
                return StatusCode(500, "Unexpected error occurred while deleting the payment.");
            }
        }
    }
}