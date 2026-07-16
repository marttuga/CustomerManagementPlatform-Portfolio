/** Represents a payment as returned by the API. */
export interface Payment {
  paymentId: number;

  /** Set if this payment belongs to a client. Mutually exclusive with dailyEntryId. */
  clientId?: number;

  /** Set if this payment belongs to a daily entry. Mutually exclusive with clientId. */
  dailyEntryId?: number;

  amount: number;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  paymentDate: string;

  invoiceNumber?: string;

  /** Resolved from the linked client, if applicable. */
  clientName?: string;

  /** Resolved from the linked daily entry, if applicable. */
  dailyEntryNotes?: string;

  /** Resolved from either the client's or daily entry's location. */
  locationName?: string;
}