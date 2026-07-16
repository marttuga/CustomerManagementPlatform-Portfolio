namespace CustomerManagement.Api.DTOs
{
    /// Payload for saving a report generation record to history.
    /// GeneratedAt is set automatically by the controller.
    public class CreateReportHistoryDto
    {
        /// Report category label 
        public string Type { get; set; } = string.Empty;

        /// Path to the generated PDF file, if saved to disk
        public string? FilePath { get; set; }

        /// JSON string with the filter criteria used to generate the report
        public string? FilterCriteriaJson { get; set; }
    }
}