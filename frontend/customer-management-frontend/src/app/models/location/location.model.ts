/**
 * Represents a location as returned by the API.
 * Includes aggregated counts - not the full client or daily entry lists.
 */
export interface Location {
  locationId: number;
  name: string;

  /**
   * URL-friendly identifier (e.g. "riverside", "hillcrest").
   * Matches the :locationKey route parameter and the LOCATION_CONFIG keys.
   */
  key: string;
  
  /** Total number of clients assigned to this location. */
  clientCount: number;

  /** Total number of daily entries recorded for this location. */
  dailyEntriesCount: number;
}