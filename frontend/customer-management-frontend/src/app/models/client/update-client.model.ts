/**
 * Payload for updating an existing client.
 * LocationId is not included - clients cannot be moved between locations.
 */
export interface UpdateClient {
  name: string;

  /** If empty for a Riverside client, the backend preserves the existing value. */
  scmlCode?: string;
  surgeryType?: string;
  insuranceType?: string;

  notes?: string;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  clientDate: string;
}