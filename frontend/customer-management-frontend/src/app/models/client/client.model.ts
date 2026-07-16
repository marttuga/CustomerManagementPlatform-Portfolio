import { Payment } from '../payment/payment.model';

/** Represents a client record as returned by the API. */
export interface Client {
  clientId: number;
  name: string;

  /** SCML identification code - only applicable for Riverside clients. */
  scmlCode?: string;
  surgeryType?: string;
  insuranceType?: string;

  /** Payments associated with this client. */
  payments: Payment[];

  locationId?: number;
  locationName?: string;

  notes?: string;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  clientDate: string;
}