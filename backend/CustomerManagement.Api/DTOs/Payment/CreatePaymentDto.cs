using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Api.DTOs
{
    /// Payload for creating a new payment.
    /// Must be linked to either a Client or a DailyEntry - not both, not neither.
    /// Validation is enforced via IValidatableObject.
    public class CreatePaymentDto : IValidatableObject
    {
        /// Set this OR DailyEntryId - not both
        public int? ClientId { get; set; }

        /// Set this OR ClientId - not both
        public int? DailyEntryId { get; set; }

        public decimal Amount { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? InvoiceNumber { get; set; }

        /// Validates that exactly one of ClientId or DailyEntryId is provided.
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (ClientId == null && DailyEntryId == null)
                yield return new ValidationResult(
                    "A payment must be linked to a Client or a DailyEntry.",
                    new[] { nameof(ClientId), nameof(DailyEntryId) }
                );

            if (ClientId != null && DailyEntryId != null)
                yield return new ValidationResult(
                    "A payment cannot reference both ClientId and DailyEntryId.",
                    new[] { nameof(ClientId), nameof(DailyEntryId) }
                );
        }
    }
}