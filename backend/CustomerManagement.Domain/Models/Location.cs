using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Domain.Models
{
    /// Represents a physical work location.
    /// Locations are seeded on first startup and managed via SQL scripts - not by the client.
    /// Locations 1-3 use the client billing model; locations 4-8 use the daily entry model.
    public class Location
    {
        [Key]
        public int LocationId { get; set; }

        /// URL-friendly identifier used for routing and filtering (e.g. "hillcrest", "riverside").
        public string Key { get; set; } = string.Empty;

        [Required(ErrorMessage = "Location name is required.")]
        [StringLength(50, ErrorMessage = "Location name cannot exceed 50 characters.")]
        public string Name { get; set; } = string.Empty;

        /// Clients assigned to this location
        public ICollection<Client> Clients { get; set; } = new List<Client>();

        /// Daily entries recorded for this location
        public ICollection<DailyEntry> DailyEntries { get; set; } = new List<DailyEntry>();
    }
}