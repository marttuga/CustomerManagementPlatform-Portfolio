import { Payment } from '../payment/payment.model';

/** Represents a daily work entry as returned by the API. */
export interface DailyEntry {
  dailyEntryId: number;
  notes?: string;

  /** Payments associated with this daily entry. */
  payments: Payment[];

  locationId: number;
  locationName: string;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  workDate: string;
}