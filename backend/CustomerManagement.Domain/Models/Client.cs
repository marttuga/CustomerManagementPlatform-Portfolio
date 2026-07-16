using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Domain.Models
{
    /// Represents a client record in the system.
    /// Clients are associated with a location and may have payments linked to them.
    /// SCMLCode is only applicable for Riverside clients.
    public class Client
    {
        [Key]
        public int ClientId { get; set; }

        [Required(ErrorMessage = "Client name is required.")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters.")]
        public string Name { get; set; } = string.Empty;

        /// 6-digit SCML identification code.
        /// Required for Riverside clients, optional for all other locations.
        [RegularExpression(@"^\d{1,6}$", ErrorMessage = "SCML Code must be up to 6 digits.")]
        [StringLength(50)]
        public string? SCMLCode { get; set; }

        [StringLength(100, ErrorMessage = "Surgery type cannot exceed 100 characters.")]
        public string? SurgeryType { get; set; }

        [StringLength(100, ErrorMessage = "Insurance type cannot exceed 100 characters.")]
        public string? InsuranceType { get; set; }

        /// Foreign key to the associated location
        public required int LocationId { get; set; }

        /// Navigation property to the associated location>
        public Location Location { get; set; } = default!;

        [StringLength(100, ErrorMessage = "Notes cannot exceed 100 characters.")]
        public string? Notes { get; set; }

        /// Payments associated with this client
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        [Required]
        public DateTime ClientDate { get; set; }
    }
}