namespace CustomerManagement.Api.DTOs
{
    /// Represents a report history record returned by the API.
    public class ReportHistoryDto
    {
        public int ReportHistoryId { get; set; }

        /// Report category label 
        public string Type { get; set; } = string.Empty;

        /// Path to the generated PDF file, if saved to disk
        public string? FilePath { get; set; }

        /// Timestamp when the report was generated (UTC)
        public DateTime GeneratedAt { get; set; }

        /// JSON string with the filter criteria used to generate the report
        public string? FilterCriteriaJson { get; set; }
    }
}