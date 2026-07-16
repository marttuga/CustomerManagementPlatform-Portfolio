using System.ComponentModel.DataAnnotations;

namespace CustomerManagement.Domain.Models
{
    /// Represents a payment record.
    /// A payment must be linked to either a Client or a DailyEntry - never both, never neither.
    /// This constraint is enforced via IValidatableObject.
    public class Payment : IValidatableObject
    {
        [Key]
        public int PaymentId { get; set; }

        /// Set if this payment belongs to a client. Mutually exclusive with DailyEntryId
        public int? ClientId { get; set; }
        public Client? Client { get; set; }

        /// Set if this payment belongs to a daily entry. Mutually exclusive with ClientId
        public int? DailyEntryId { get; set; }
        public DailyEntry? DailyEntry { get; set; }

        public decimal Amount { get; set; }

        /// Payment date. Nullable to allow registering a payment without a confirmed date.
        /// Consistent with CreatePaymentDto which also accepts null.
        [DataType(DataType.Date)]
        public DateTime? PaymentDate { get; set; }

        [StringLength(50)]
        public string? InvoiceNumber { get; set; }

        /// Validates that exactly one of ClientId or DailyEntryId is provided.
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (ClientId == null && DailyEntryId == null)
                yield return new ValidationResult(
                    "A payment must be associated with either a Client or a DailyEntry.",
                    new[] { nameof(ClientId), nameof(DailyEntryId) }
                );

            if (ClientId != null && DailyEntryId != null)
                yield return new ValidationResult(
                    "A payment cannot be associated with both a Client and a DailyEntry.",
                    new[] { nameof(ClientId), nameof(DailyEntryId) }
                );
        }
    }
}