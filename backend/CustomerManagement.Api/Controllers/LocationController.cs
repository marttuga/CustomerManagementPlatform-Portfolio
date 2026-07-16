using AutoMapper;
using CustomerManagement.Api.DTOs;
using CustomerManagement.Domain.Models;
using CustomerManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers
{
    [ApiController]
    [Route("api/location")]
    public class LocationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<LocationController> _logger;
        private readonly IMapper _mapper;

        public LocationController(AppDbContext context, ILogger<LocationController> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        /// Returns all locations with their client and daily entry counts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationDto>>> GetLocations()
        {
            try
            {
                var locations = await _context.Locations
                    .Include(l => l.Clients)
                    .Include(l => l.DailyEntries)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<LocationDto>>(locations));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching locations");
                return StatusCode(500, "An unexpected error occurred while retrieving locations.");
            }
        }

        /// Returns a single location by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<LocationDto>> GetLocation(int id)
        {
            try
            {
                var location = await _context.Locations
                    .Include(l => l.Clients)
                    .Include(l => l.DailyEntries)
                    .FirstOrDefaultAsync(l => l.LocationId == id);

                if (location == null)
                {
                    _logger.LogWarning("Location with ID {LocationId} not found.", id);
                    return NotFound();
                }

                return Ok(_mapper.Map<LocationDto>(location));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching location ID {LocationId}", id);
                return StatusCode(500, "An unexpected error occurred while retrieving the location.");
            }
        }

        /// Creates a new location
        [HttpPost]
        public async Task<ActionResult<LocationDto>> CreateLocation([FromBody] CreateLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var location = _mapper.Map<Location>(dto);
                _context.Locations.Add(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new location: {LocationName}", location.Name);

                return CreatedAtAction(nameof(GetLocation),
                    new { id = location.LocationId },
                    _mapper.Map<LocationDto>(location));
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error while creating location");
                return StatusCode(500, "Database error occurred while creating the location.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating location");
                return StatusCode(500, "Unexpected error occurred while creating the location.");
            }
        }

        /// Updates the name of an existing location
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] UpdateLocationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var location = await _context.Locations.FindAsync(id);
                if (location == null)
                    return NotFound();

                _mapper.Map(dto, location);
                _context.Locations.Update(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated location with ID {LocationId}", id);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Locations.Any(l => l.LocationId == id))
                    return NotFound();
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating location ID {LocationId}", id);
                return StatusCode(500, "Unexpected error occurred while updating the location.");
            }
        }

        /// Deletes a location by ID.
        /// Clients assigned to this location will have their LocationId set to null (SetNull behaviour).
        /// DailyEntries assigned to this location will be deleted (Cascade behaviour).
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            try
            {
                var location = await _context.Locations.FindAsync(id);
                if (location == null)
                {
                    _logger.LogWarning("Attempted to delete non-existent location ID {LocationId}", id);
                    return NotFound();
                }

                _context.Locations.Remove(location);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted location ID {LocationId}", id);
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error while deleting location ID {LocationId}", id);
                return StatusCode(500, "Database error occurred while deleting the location.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting location ID {LocationId}", id);
                return StatusCode(500, "Unexpected error occurred while deleting the location.");
            }
        }
    }
}