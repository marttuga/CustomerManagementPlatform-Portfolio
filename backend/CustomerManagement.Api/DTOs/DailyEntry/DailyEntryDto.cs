namespace CustomerManagement.Api.DTOs
{
    /// Represents a daily work entry returned by the API.
    /// Used for locations that operate on a daily billing model.
    public class DailyEntryDto
    {
        public int DailyEntryId { get; set; }
        public string? Notes { get; set; }

        public int LocationId { get; set; }
        public string LocationName { get; set; } = string.Empty;

        /// Payments associated with this daily entry
        public List<PaymentDto> Payments { get; set; } = new();

        public DateTime WorkDate { get; set; }
    }
}