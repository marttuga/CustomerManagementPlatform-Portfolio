using AutoMapper;
using CustomerManagement.Api.DTOs;
using CustomerManagement.Domain.Models;
using CustomerManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers
{
    [ApiController]
    [Route("api/dailyEntry")]
    public class DailyEntryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DailyEntryController> _logger;
        private readonly IMapper _mapper;

        public DailyEntryController(AppDbContext context, ILogger<DailyEntryController> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        /// Returns all daily entries with their location and payments
        [HttpGet("getAll")]
        public async Task<ActionResult<IEnumerable<DailyEntryDto>>> GetAllEntries()
        {
            try
            {
                var entries = await _context.DailyEntries
                    .Include(e => e.Location)
                    .Include(e => e.Payments)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<DailyEntryDto>>(entries));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all daily entries");
                return StatusCode(500, "Unexpected error occurred while retrieving daily entries.");
            }
        }

        /// Returns a single daily entry by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<DailyEntryDto>> GetDailyEntry(int id)
        {
            try
            {
                var dailyEntry = await _context.DailyEntries
                    .Include(e => e.Location)
                    .Include(e => e.Payments)
                    .FirstOrDefaultAsync(e => e.DailyEntryId == id);

                if (dailyEntry == null)
                    return NotFound();

                return Ok(_mapper.Map<DailyEntryDto>(dailyEntry));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching daily entry ID {DailyEntryId}", id);
                return StatusCode(500, "Unexpected error occurred while retrieving the daily entry.");
            }
        }

        /// Returns all daily entries for a specific location by its key
        [HttpGet("location/{locationKey}")]
        public async Task<ActionResult<IEnumerable<DailyEntryDto>>> GetByLocation(string locationKey)
        {
            try
            {
                var key = locationKey.ToLower();

                var entries = await _context.DailyEntries
                    .Include(d => d.Location)
                    .Include(d => d.Payments)
                    .Where(d => d.Location != null && d.Location.Key.ToLower() == key)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<DailyEntryDto>>(entries));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching daily entries for location {LocationKey}", locationKey);
                return StatusCode(500, "Unexpected error occurred while retrieving daily entries by location.");
            }
        }

        /// Creates a new daily entry.
        /// Returns 409 Conflict if an entry already exists for the same location and date.
        [HttpPost]
        public async Task<ActionResult<DailyEntryDto>> CreateDailyEntry(CreateDailyEntryDto dto)
        {
            try
            {
                var location = await _context.Locations
                    .FirstOrDefaultAsync(l => l.LocationId == dto.LocationId);

                if (location == null)
                    return BadRequest("Invalid Location");

                // Only one daily entry is allowed per location per day
                var duplicate = await _context.DailyEntries
                    .Include(d => d.Location)
                    .Where(d => d.LocationId == dto.LocationId &&
                                d.WorkDate.Date == dto.WorkDate.Date)
                    .ToListAsync();

                if (duplicate.Any())
                {
                    return Conflict(new
                    {
                        status = "duplicate",
                        reason = "Daily entry already exists for this date and location",
                        matches = _mapper.Map<IEnumerable<DailyEntryDto>>(duplicate),
                        locationKey = location.Key.ToLower()
                    });
                }

                var entry = _mapper.Map<DailyEntry>(dto);
                _context.DailyEntries.Add(entry);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Daily entry created for location {LocationId} on {WorkDate}",
                    dto.LocationId, dto.WorkDate.Date);

                return CreatedAtAction(nameof(GetDailyEntry),
                    new { id = entry.DailyEntryId },
                    _mapper.Map<DailyEntryDto>(entry));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating daily entry");
                return StatusCode(500, "Unexpected error occurred while creating the daily entry.");
            }
        }

        /// Updates the notes or date of an existing daily entry
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDailyEntry(int id, UpdateDailyEntryDto dto)
        {
            try
            {
                var daily = await _context.DailyEntries.FindAsync(id);
                if (daily == null)
                    return NotFound();

                _mapper.Map(dto, daily);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating daily entry ID {DailyEntryId}", id);
                return StatusCode(500, "Unexpected error occurred while updating the daily entry.");
            }
        }

        /// Deletes a daily entry by ID. Associated payments are removed via cascade
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDailyEntry(int id)
        {
            try
            {
                var entry = await _context.DailyEntries.FindAsync(id);
                if (entry == null)
                    return NotFound();

                _context.DailyEntries.Remove(entry);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting daily entry ID {DailyEntryId}", id);
                return StatusCode(500, "Unexpected error occurred while deleting the daily entry.");
            }
        }
    }
}