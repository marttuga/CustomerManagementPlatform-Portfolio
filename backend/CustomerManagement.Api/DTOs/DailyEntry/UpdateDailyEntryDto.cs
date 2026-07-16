namespace CustomerManagement.Api.DTOs
{
    /// Payload for updating an existing daily entry.
    /// LocationId is not included - entries cannot be moved between locations.
    public class UpdateDailyEntryDto
    {
        public string? Notes { get; set; }
        public DateTime WorkDate { get; set; }
    }
}