/**
 * Payload for updating an existing payment.
 * ClientId and dailyEntryId are not included - payment ownership cannot be changed.
 */
export interface UpdatePayment {
  amount: number;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  paymentDate: string;

  invoiceNumber?: string;
}