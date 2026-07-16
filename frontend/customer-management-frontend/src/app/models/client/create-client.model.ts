/** Payload for creating a new client. */
export interface CreateClient {
  name: string;

  /** SCML code - required for Riverside, optional for other locations. */
  scmlCode?: string;
  surgeryType?: string;
  insuranceType?: string;

  locationId?: number;
  notes?: string;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  clientDate: string;
}