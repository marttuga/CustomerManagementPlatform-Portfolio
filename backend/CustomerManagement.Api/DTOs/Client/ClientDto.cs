namespace CustomerManagement.Api.DTOs
{
    /// Represents a client record returned by the API.
    /// Includes location info and associated payments.
    public class ClientDto
    {
        public int ClientId { get; set; }
        public string Name { get; set; } = string.Empty;

        /// SCML code - only applicable for Riverside clients
        public string? SCMLCode { get; set; }
        public string? SurgeryType { get; set; }
        public string? InsuranceType { get; set; }

        public int LocationId { get; set; }
        public string? LocationName { get; set; }
        public string? Notes { get; set; }

        /// Payments associated with this client
        public List<PaymentDto> Payments { get; set; } = new();

        public DateTime ClientDate { get; set; }
    }
}