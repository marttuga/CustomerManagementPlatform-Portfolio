/**
 * Payload for creating a new daily entry.
 * Only one entry per location per day is allowed - duplicates are rejected by the API.
 */
export interface CreateDailyEntry {
  notes?: string;
  locationId: number;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  workDate: string;
}