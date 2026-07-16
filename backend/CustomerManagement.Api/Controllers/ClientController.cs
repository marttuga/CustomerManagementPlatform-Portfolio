using AutoMapper;
using CustomerManagement.Api.DTOs;
using CustomerManagement.Domain.Models;
using CustomerManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Api.Controllers
{
    [ApiController]
    [Route("api/client")]
    public class ClientController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ClientController> _logger;
        private readonly IMapper _mapper;

        public ClientController(AppDbContext context, ILogger<ClientController> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        /// Returns all clients with their location and payments.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetClients()
        {
            try
            {
                var clients = await _context.Clients
                    .Include(c => c.Location)
                    .Include(c => c.Payments)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<ClientDto>>(clients));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all clients");
                return StatusCode(500, "Unexpected error occurred while retrieving clients.");
            }
        }

        /// Returns all clients belonging to a specific location by its key
        [HttpGet("location/{locationKey}")]
        public async Task<ActionResult<IEnumerable<ClientDto>>> GetByLocation(string locationKey)
        {
            try
            {
                var key = locationKey.ToLower();

                var clients = await _context.Clients
                    .Include(c => c.Location)
                    .Include(c => c.Payments)
                    .Where(c => c.Location != null && c.Location.Key.ToLower() == key)
                    .ToListAsync();

                return Ok(_mapper.Map<IEnumerable<ClientDto>>(clients));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching clients for location {LocationKey}", locationKey);
                return StatusCode(500, "Unexpected error occurred while retrieving clients by location.");
            }
        }

        /// Returns a single client by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDto>> GetClient(int id)
        {
            try
            {
                var client = await _context.Clients
                    .Include(c => c.Location)
                    .Include(c => c.Payments)
                    .FirstOrDefaultAsync(c => c.ClientId == id);

                if (client == null)
                    return NotFound();

                return Ok(_mapper.Map<ClientDto>(client));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching client ID {ClientId}", id);
                return StatusCode(500, "Unexpected error occurred while retrieving the client.");
            }
        }

        /// Creates a new client.
        /// Returns 409 Conflict if a duplicate is detected based on location-specific rules.
        [HttpPost]
        public async Task<ActionResult<ClientDto>> CreateClient(CreateClientDto dto)
        {
            try
            {
                var location = await _context.Locations
                    .FirstOrDefaultAsync(l => l.LocationId == dto.LocationId);

                if (location == null)
                    return BadRequest("Invalid Location");

                // Check for duplicates based on location-specific matching rules
                var duplicates = await FindClientDuplicates(dto, location.Key).ToListAsync();

                if (duplicates.Any())
                {
                    return Conflict(new
                    {
                        status = "duplicate",
                        reason = "Client already exists for this location",
                        matches = _mapper.Map<IEnumerable<ClientDto>>(duplicates),
                        locationKey = location.Key.ToLower()
                    });
                }

                var client = _mapper.Map<Client>(dto);
                _context.Clients.Add(client);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Client created successfully: {ClientId}", client.ClientId);

                return CreatedAtAction(nameof(GetClient),
                    new { id = client.ClientId },
                    _mapper.Map<ClientDto>(client));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating client");
                return StatusCode(500, "Unexpected error occurred while creating the client.");
            }
        }

        /// Updates an existing client.
        /// Protects the SCMLCode field for Riverside clients - if sent empty, the existing value is preserved.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, UpdateClientDto dto)
        {
            try
            {
                var client = await _context.Clients
                    .Include(c => c.Location)
                    .FirstOrDefaultAsync(c => c.ClientId == id);

                if (client == null)
                    return NotFound();

                // Preserve existing SCMLCode for Riverside clients if the update sends it empty
                var oldScmlCode = client.SCMLCode;
                _mapper.Map(dto, client);

                if (client.Location?.Key.ToLower() == "riverside" && string.IsNullOrWhiteSpace(client.SCMLCode))
                    client.SCMLCode = oldScmlCode;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating client ID {ClientId}", id);
                return StatusCode(500, "Unexpected error occurred while updating the client.");
            }
        }

        /// Deletes a client by ID. Associated payments are removed via cascade
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            try
            {
                var client = await _context.Clients.FindAsync(id);
                if (client == null)
                    return NotFound();

                _context.Clients.Remove(client);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting client ID {ClientId}", id);
                return StatusCode(500, "Unexpected error occurred while deleting the client.");
            }
        }

        // -------------------------------------------------------------------------
        // PRIVATE METHODS
        // -------------------------------------------------------------------------

        /// Returns a queryable of duplicate clients based on location-specific matching rules:
        /// - Riverside: matches on Name, SCMLCode, InsuranceType, ClientDate and SurgeryType
        /// - Hillcrest: matches on Name, InsuranceType, ClientDate and SurgeryType
        /// - Oakdale: matches on Name and ClientDate only
        /// - Other locations: no duplicate check applied
        private IQueryable<Client> FindClientDuplicates(CreateClientDto dto, string locationKey)
        {
            var key = locationKey?.ToLower() ?? "";

            var query = _context.Clients
                .Include(c => c.Location)
                .Where(c => c.Location.Key.ToLower() == key);

            switch (key)
            {
                case "riverside":
                    return query.Where(c =>
                        c.Name.ToLower() == dto.Name.ToLower() &&
                        (c.SCMLCode ?? "").ToLower() == (dto.SCMLCode ?? "").ToLower() &&
                        (c.InsuranceType ?? "").ToLower() == (dto.InsuranceType ?? "").ToLower() &&
                        c.ClientDate.Date == dto.ClientDate.Date &&
                        (c.SurgeryType ?? "").ToLower() == (dto.SurgeryType ?? "").ToLower());

                case "hillcrest":
                    return query.Where(c =>
                        c.Name.ToLower() == dto.Name.ToLower() &&
                        (c.InsuranceType ?? "").ToLower() == (dto.InsuranceType ?? "").ToLower() &&
                        c.ClientDate.Date == dto.ClientDate.Date &&
                        (c.SurgeryType ?? "").ToLower() == (dto.SurgeryType ?? "").ToLower());

                case "oakdale":
                    return query.Where(c =>
                        c.Name.ToLower() == dto.Name.ToLower() &&
                        c.ClientDate.Date == dto.ClientDate.Date);

                default:
                    // No duplicate check for other locations
                    return Enumerable.Empty<Client>().AsQueryable();
            }
        }
    }
}