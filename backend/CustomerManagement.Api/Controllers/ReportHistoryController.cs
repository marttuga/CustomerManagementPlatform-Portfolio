using AutoMapper;
using CustomerManagement.Api.DTOs;
using CustomerManagement.Domain.Models;
using CustomerManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers
{
    [ApiController]
    [Route("api/report")]
    public class ReportHistoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ReportHistoryController> _logger;
        private readonly IMapper _mapper;

        public ReportHistoryController(AppDbContext context, ILogger<ReportHistoryController> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        /// Returns all report history records ordered by most recent first
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReportHistoryDto>>> GetReports()
        {
            try
            {
                var reports = await _context.ReportHistories
                    .OrderByDescending(r => r.GeneratedAt)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<ReportHistoryDto>>(reports));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching reports");
                return StatusCode(500, "Unexpected error occurred while retrieving reports.");
            }
        }

        /// Returns a single report history record by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ReportHistoryDto>> GetReport(int id)
        {
            try
            {
                var report = await _context.ReportHistories.FindAsync(id);
                if (report == null)
                    return NotFound();

                return Ok(_mapper.Map<ReportHistoryDto>(report));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching report ID {ReportId}", id);
                return StatusCode(500, "Unexpected error occurred while retrieving the report.");
            }
        }

        /// Saves a new report generation record to history.
        /// GeneratedAt is set automatically to the current UTC time.
        [HttpPost]
        public async Task<ActionResult<ReportHistoryDto>> CreateReport([FromBody] CreateReportHistoryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var report = _mapper.Map<ReportHistory>(dto);
                report.GeneratedAt = DateTime.UtcNow;

                _context.ReportHistories.Add(report);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetReport),
                    new { id = report.ReportHistoryId },
                    _mapper.Map<ReportHistoryDto>(report));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report history record");
                return StatusCode(500, "Unexpected error while creating report.");
            }
        }

        /// Deletes a report history record by ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            try
            {
                var report = await _context.ReportHistories.FindAsync(id);
                if (report == null)
                    return NotFound();

                _context.ReportHistories.Remove(report);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report ID {ReportId}", id);
                return StatusCode(500, "Unexpected error occurred while deleting report.");
            }
        }

        /// Generates a monthly (or annual) pending items report for a given location.
        /// Locations 4-8 use the daily entry model; locations 1-3 use the client model.
        /// Month 13 is a frontend convention to request the full annual report.
        [HttpGet("generate-monthly/{locationId}")]
        public async Task<IActionResult> GenerateMonthlyReport(
            int locationId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            try
            {
                var location = await _context.Locations.FindAsync(locationId);
                if (location == null)
                    return NotFound("Location not found.");

                DateTime startDate;
                DateTime endDate;

                // Month 13 is a convention used by the frontend to request the full annual report
                if (month == 13)
                {
                    startDate = new DateTime(year, 1, 1);
                    endDate = startDate.AddYears(1);
                }
                else
                {
                    startDate = new DateTime(year, month, 1);
                    endDate = startDate.AddMonths(1);
                }

                // Locations 4-8 operate on a daily billing model (DailyEntry)
                // Locations 1-3 operate on a client billing model (Client)
                var dailyModelLocationIds = new List<int> { 4, 5, 6, 7, 8 };

                if (dailyModelLocationIds.Contains(locationId))
                    return await GetDailyModelData(location, month, year, startDate, endDate);
                else
                    return await GetClientModelData(location, month, year, startDate, endDate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Critical error generating monthly report for location {LocationId}", locationId);
                return StatusCode(500, "Unexpected error occurred while generating the report.");
            }
        }

        // -------------------------------------------------------------------------
        // PRIVATE METHODS
        // -------------------------------------------------------------------------

        /// Builds report data for client-model locations (1-3).
        /// Returns clients in the given period that have no associated payments.
        /// Riverside (ID 1) includes the SCMLCode field; other locations do not.
        private async Task<IActionResult> GetClientModelData(
            Location loc, int month, int year, DateTime start, DateTime end)
        {
            var isRiverside = loc.LocationId == 1;

            var pendingClients = await _context.Clients
                .Where(c => c.LocationId == loc.LocationId
                         && c.ClientDate >= start
                         && c.ClientDate < end)
                .Include(c => c.Payments)
                .OrderBy(c => c.ClientDate)
                .ToListAsync();

            // Only include clients with no payments - these are the pending ones
            var data = pendingClients
                .Where(c => !c.Payments.Any())
                .Select(c => new {
                    name = c.Name,
                    scmlCode = isRiverside ? c.SCMLCode : null,
                    surgeryType = c.SurgeryType ?? "---",
                    insuranceType = c.InsuranceType ?? "---",
                    date = c.ClientDate,
                    notes = c.Notes ?? ""
                }).ToList();

            return CreateReportResponse(loc.Name, isRiverside, false, month, year, data);
        }

        /// Builds report data for daily-entry-model locations (4-8).
        /// Returns daily entries in the given period that have no associated payments.
        private async Task<IActionResult> GetDailyModelData(
            Location loc, int month, int year, DateTime start, DateTime end)
        {
            var unpaidDays = await _context.DailyEntries
                .Where(d => d.LocationId == loc.LocationId
                         && d.WorkDate >= start
                         && d.WorkDate < end)
                .Include(d => d.Payments)
                .OrderBy(d => d.WorkDate)
                .ToListAsync();

            // Only include entries with no payments - these are the pending ones
            var data = unpaidDays
                .Where(d => !d.Payments.Any())
                .Select(d => new {
                    name = "Daily Entry",
                    date = d.WorkDate,
                    notes = d.Notes ?? ""
                }).ToList();

            return CreateReportResponse(loc.Name, false, true, month, year, data);
        }

        /// Builds the standardised report response object.
        /// Month 0 produces an "Ano YYYY" label; any other month produces "MM/YYYY".
        private OkObjectResult CreateReportResponse(
            string locName, bool isRiverside, bool isDaily, int m, int y, IEnumerable<object> data)
        {
            // Month 0 means annual report - show year label instead of month/year
            string periodLabel = (m == 0) ? $"Ano {y}" : $"{m:D2}/{y}";

            return Ok(new {
                LocationName = locName,
                IsRiverside = isRiverside,
                IsDailyModel = isDaily,
                MonthYear = periodLabel,
                GeneratedAt = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
                TotalPendingItems = data.Count(),
                Data = data
            });
        }
    }
}