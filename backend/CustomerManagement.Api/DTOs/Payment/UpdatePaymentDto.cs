namespace CustomerManagement.Api.DTOs
{
    /// Payload for updating an existing payment.
    /// ClientId and DailyEntryId are not included - payment ownership cannot be changed.
    public class UpdatePaymentDto
    {
        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? InvoiceNumber { get; set; }
    }
}