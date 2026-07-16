namespace CustomerManagement.Api.DTOs
{
    /// Payload for updating an existing client.
    /// LocationId is not included - clients cannot be moved between locations.
    public class UpdateClientDto
    {
        public string Name { get; set; } = string.Empty;
        public string? SurgeryType { get; set; }
        public string? InsuranceType { get; set; }

        /// SCML code update. If empty for a Riverside client,
        /// the controller preserves the existing value.
        public string? SCMLCode { get; set; }

        public string? Notes { get; set; }
        public DateTime ClientDate { get; set; }
    }
}