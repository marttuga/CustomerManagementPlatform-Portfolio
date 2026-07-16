using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Domain.Models
{
    /// Represents a daily work entry for locations that operate on a daily billing model.
    /// Only one entry per location per day is allowed.
    public class DailyEntry
    {
        [Key]
        public int DailyEntryId { get; set; }

        [StringLength(100, ErrorMessage = "Notes cannot exceed 100 characters.")]
        public string? Notes { get; set; }

        /// Payments associated with this daily entry
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        /// Foreign key to the associated location
        public required int LocationId { get; set; }

        /// Navigation property to the associated location
        public Location Location { get; set; } = default!;

        [Required]
        public DateTime WorkDate { get; set; }
    }
}