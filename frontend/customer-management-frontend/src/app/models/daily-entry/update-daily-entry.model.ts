/**
 * Payload for updating an existing daily entry.
 * LocationId is not included - entries cannot be moved between locations.
 */
export interface UpdateDailyEntry {
  notes?: string;

  /** ISO date string (e.g. "2025-03-01T00:00:00Z"). */
  workDate: string;
}