namespace CustomerManagement.Api.DTOs
{
    /// Payload for updating an existing location name.
    public class UpdateLocationDto
    {
        public string Name { get; set; } = string.Empty;
    }
}