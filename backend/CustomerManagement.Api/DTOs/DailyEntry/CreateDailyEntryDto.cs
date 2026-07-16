namespace CustomerManagement.Api.DTOs
{
    /// Payload for creating a new daily entry.
    /// Only one entry per location per day is allowed - duplicates are rejected.
    public class CreateDailyEntryDto
    {
        public int LocationId { get; set; }
        public string? Notes { get; set; }
        public DateTime WorkDate { get; set; }
    }
}