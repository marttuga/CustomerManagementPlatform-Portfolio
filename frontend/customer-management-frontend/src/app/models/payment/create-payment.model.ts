/**
 * Payload for creating a new payment.
 * Exactly one of clientId or dailyEntryId must be provided - not both, not neither.
 */
export interface CreatePayment {
  /** Set this OR dailyEntryId - not both. */
  clientId?: number | null;

  /** Set this OR clientId - not both. */
  dailyEntryId?: number | null;

  amount: number;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  paymentDate: string;

  invoiceNumber?: string;
}