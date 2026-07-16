namespace CustomerManagement.Api.DTOs
{
    /// Payload for creating a new client.
    public class CreateClientDto
    {
        public string Name { get; set; } = string.Empty;

        /// SCML code - required for Riverside
        public string? SCMLCode { get; set; }
        public string? SurgeryType { get; set; }
        public string? InsuranceType { get; set; }

        public int LocationId { get; set; }
        public string? Notes { get; set; }
        public DateTime ClientDate { get; set; }
    }
}