using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Domain.Models
{
    /// Represents a historical record of a report that was generated.
    /// Created automatically whenever a report is produced via the API.
    public class ReportHistory
    {
        [Key]
        public int ReportHistoryId { get; set; }

        /// Report category label 
        [Required(ErrorMessage = "Report type is required.")]
        [StringLength(100, ErrorMessage = "Type cannot exceed 100 characters.")]
        public string Type { get; set; } = string.Empty;

        /// Timestamp when the report was generated (UTC). Defaults to current UTC time
        [Required]
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        /// Path to the generated PDF file on disk, if saved
        [StringLength(255)]
        public string? FilePath { get; set; }

        /// JSON string with the filter criteria used to generate the report
        public string? FilterCriteriaJson { get; set; }
    }
}