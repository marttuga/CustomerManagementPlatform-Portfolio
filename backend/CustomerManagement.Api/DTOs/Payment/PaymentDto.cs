namespace CustomerManagement.Api.DTOs
{
    /// Represents a payment returned by the API.
    /// A payment is linked to either a Client or a DailyEntry - never both.
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }

        /// Set if this payment belongs to a client
        public int? ClientId { get; set; }

        /// Set if this payment belongs to a daily entry
        public int? DailyEntryId { get; set; }

        public string? InvoiceNumber { get; set; }

        /// Client name - populated if linked to a client
        public string? ClientName { get; set; }

        /// Daily entry notes - populated if linked to a daily entry
        public string? DailyEntryNotes { get; set; }

        /// Location name resolved from either the client or daily entry.
        public string? LocationName { get; set; }
    }
}