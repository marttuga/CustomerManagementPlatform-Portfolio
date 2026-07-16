namespace CustomerManagement.Api.DTOs
{
    /// Represents a location returned by the API
    /// Includes aggregated counts of associated clients and daily entries
    public class LocationDto
    {
        public int LocationId { get; set; }
        public string Name { get; set; } = string.Empty;

        /// URL-friendly identifier used for routing and filtering (e.g. "hillcrest", "riverside").
        /// Matches the key used in the frontend route /locations/:locationKey.
        public string Key { get; set; } = string.Empty;

        /// Total number of clients assigned to this location
        public int ClientCount { get; set; }

        /// Total number of daily entries recorded for this location
        public int DailyEntriesCount { get; set; }
    }
}