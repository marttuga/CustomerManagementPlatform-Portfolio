using CustomerManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Infrastructure.Data
{
    public static class DbSeeder
    {
        /// Applies pending migrations and seeds required configuration data (locations).
        /// Locations are read from appsettings.json - safe to run in production.
        /// Skips if locations already exist in the database.
        public static void Seed(AppDbContext context, List<Location> locations)
        {
            try
            {
                // Apply any pending migrations on startup
                context.Database.Migrate();

                // Seed locations from appsettings.json
                SeedLocations(context, locations);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Seeder Error]: {ex.Message}");
            }
        }

        /// Seeds fake data for development and testing purposes only.
        /// Must NEVER be called in production - will wipe and recreate all data.
        /// All names, notes and data below are fictional and randomly generated for demo purposes.
        public static void SeedDevelopmentData(AppDbContext context)
        {
            try
            {
                // Clear all existing data before re-seeding fake data
                context.Payments.RemoveRange(context.Payments);
                context.DailyEntries.RemoveRange(context.DailyEntries);
                context.Clients.RemoveRange(context.Clients);
                context.Locations.RemoveRange(context.Locations);
                context.SaveChanges();

                // Re-seed locations from the database (already seeded by Seed())
                // We use hardcoded IDs here since this is dev-only data
                var devLocations = new List<Location>
                {
                    new Location { LocationId = 1, Name = "Riverside",  Key = "riverside" },
                    new Location { LocationId = 2, Name = "Hillcrest",  Key = "hillcrest" },
                    new Location { LocationId = 3, Name = "Oakdale",    Key = "oakdale" },
                    new Location { LocationId = 4, Name = "Fairview",   Key = "fairview" },
                    new Location { LocationId = 5, Name = "Northgate",  Key = "northgate" },
                    new Location { LocationId = 6, Name = "Sunview",    Key = "sunview" },
                    new Location { LocationId = 7, Name = "Elmwood",    Key = "elmwood" },
                    new Location { LocationId = 8, Name = "Ashford",    Key = "ashford" }
                };
                context.Locations.AddRange(devLocations);
                context.SaveChanges();

                // Seed fake clients, daily entries and payments for testing
                SeedClients(context);
                SeedDailyEntries(context);
                SeedPayments(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Dev Seeder Error]: {ex.Message}");
            }
        }

        // -------------------------------------------------------------------------
        // PRIVATE METHODS
        // -------------------------------------------------------------------------

        /// Seeds locations from appsettings.json. Skips if locations already exist.
        /// To add or remove locations, edit the "Locations" section in appsettings.json.
        private static void SeedLocations(AppDbContext context, List<Location> locations)
        {
            if (context.Locations.Any()) return;
            if (!locations.Any()) return;

            context.Locations.AddRange(locations);
            context.SaveChanges();
        }

        /// Seeds fake clients for development testing across multiple locations.
        private static void SeedClients(AppDbContext context)
        {
            var clients = new List<Client>
            {
                // --- RIVERSIDE (LocationId = 1) ---
                new Client { Name = "John Smith",        SCMLCode = "000100", InsuranceType = "MediCare Plus",   SurgeryType = "Septoplasty",     LocationId = 1, ClientDate = DateTime.UtcNow.AddMonths(-1) },
                new Client { Name = "Mary Johnson",       SCMLCode = "000101", InsuranceType = "HealthGuard",     SurgeryType = "Tonsillectomy",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-5) },
                new Client { Name = "Richard Turner",      SCMLCode = "000102", InsuranceType = "WellPoint",       SurgeryType = "Rhinoplasty",      LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-2) },
                new Client { Name = "Anna Scott",          SCMLCode = "000103", InsuranceType = "PrimeHealth",     SurgeryType = "Adenoidectomy",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-12) },
                new Client { Name = "Peter Adams",         SCMLCode = "000104", InsuranceType = "CareFirst",       SurgeryType = "Tympanoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-20) },
                new Client { Name = "Catherine Moore",     SCMLCode = "000105", InsuranceType = "MediCare Plus",   SurgeryType = "Myringoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-15) },
                new Client { Name = "Michael Bennett",     SCMLCode = "000106", InsuranceType = "HealthGuard",     SurgeryType = "Septoplasty",     LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-3) },
                new Client { Name = "Beatrice Ford",       SCMLCode = "000107", InsuranceType = "WellPoint",       SurgeryType = "Turbinoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-25) },
                new Client { Name = "Thomas Olsen",        SCMLCode = "000108", InsuranceType = "PrimeHealth",     SurgeryType = "Polypectomy",     LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-30) },
                new Client { Name = "Irene Grant",         SCMLCode = "000109", InsuranceType = "MediCare Plus",   SurgeryType = "Tonsillectomy",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-1) },
                new Client { Name = "Brian Sanders",       SCMLCode = "000110", InsuranceType = "HealthGuard",     SurgeryType = "Rhinoplasty",      LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-8) },
                new Client { Name = "Sarah Watts",         SCMLCode = "000111", InsuranceType = "WellPoint",       SurgeryType = "Septoplasty",     LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-18) },
                new Client { Name = "Gary Lawson",         SCMLCode = "000112", InsuranceType = "PrimeHealth",     SurgeryType = "Tympanoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-4) },
                new Client { Name = "Martha Payne",        SCMLCode = "000113", InsuranceType = "CareFirst",       SurgeryType = "Adenoidectomy",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-22) },
                new Client { Name = "Hugh Alden",          SCMLCode = "000114", InsuranceType = "MediCare Plus",   SurgeryType = "Myringoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-6) },
                new Client { Name = "Sophie Reeves",       SCMLCode = "000115", InsuranceType = "HealthGuard",     SurgeryType = "Turbinoplasty",   LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-10) },
                new Client { Name = "Daniel Cross",        SCMLCode = "000116", InsuranceType = "WellPoint",       SurgeryType = "Polypectomy",     LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-14) },
                new Client { Name = "Patricia Lyman",      SCMLCode = "000117", InsuranceType = "PrimeHealth",     SurgeryType = "Septoplasty",     LocationId = 1, ClientDate = DateTime.UtcNow.AddDays(-28) },

                // --- HILLCREST (LocationId = 2) ---
                new Client { Name = "Carla Mendez", SCMLCode = null, InsuranceType = "PrimeHealth", SurgeryType = "Tympanoplasty", LocationId = 2, ClientDate = DateTime.UtcNow.AddMonths(-2) },
                new Client { Name = "Derek Voss",    SCMLCode = null, InsuranceType = "WellPoint",   SurgeryType = "Rhinoplasty",    LocationId = 2, ClientDate = DateTime.UtcNow.AddDays(-10) },

                // --- OAKDALE (LocationId = 3) ---
                new Client { Name = "Joseph Perry", SCMLCode = null, InsuranceType = "CareFirst", LocationId = 3, ClientDate = DateTime.UtcNow.AddMonths(-1) }
            };

            context.Clients.AddRange(clients);
            context.SaveChanges();
        }

        /// Seeds fake daily entries for development testing.
        private static void SeedDailyEntries(AppDbContext context)
        {
            var dailyEntries = new List<DailyEntry>
            {
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-15), Notes = "General Consultation", LocationId = 4 },
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-2),  Notes = "Afternoon Surgery Block", LocationId = 4 },
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-20), Notes = "Diagnostic Exams",     LocationId = 5 },
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-12), Notes = "Consultations",        LocationId = 6 },
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-30), Notes = "Surgeries",            LocationId = 7 },
                new DailyEntry { WorkDate = DateTime.UtcNow.AddDays(-8),  Notes = "Emergency Support",    LocationId = 8 }
            };

            context.DailyEntries.AddRange(dailyEntries);
            context.SaveChanges();
        }

        /// Seeds fake payments linked to clients and daily entries for development testing.
        private static void SeedPayments(AppDbContext context)
        {
            // Fetch seeded records to get their generated IDs
            var clients = context.Clients.OrderBy(c => c.ClientId).ToList();
            var entries = context.DailyEntries.OrderBy(d => d.DailyEntryId).ToList();

            var payments = new List<Payment>
            {
                // Payments linked to Riverside clients
                new Payment { ClientId = clients[0].ClientId,  Amount = 300m, PaymentDate = DateTime.UtcNow.AddDays(-10), InvoiceNumber = "INV-001" },
                new Payment { ClientId = clients[2].ClientId,  Amount = 450m, PaymentDate = DateTime.UtcNow.AddDays(-1),  InvoiceNumber = "INV-004" },
                new Payment { ClientId = clients[4].ClientId,  Amount = 380m, PaymentDate = DateTime.UtcNow.AddDays(-5),  InvoiceNumber = "INV-005" },
                new Payment { ClientId = clients[6].ClientId,  Amount = 320m, PaymentDate = DateTime.UtcNow.AddDays(-2),  InvoiceNumber = "INV-006" },

                // Payments linked to Hillcrest and Oakdale clients
                new Payment { ClientId = clients[18].ClientId, Amount = 420m, PaymentDate = DateTime.UtcNow.AddDays(-15), InvoiceNumber = "INV-002" },
                new Payment { ClientId = clients[20].ClientId, Amount = 95m,  PaymentDate = DateTime.UtcNow.AddDays(-5),  InvoiceNumber = "INV-003" },

                // Payments linked to daily entries
                new Payment { DailyEntryId = entries[0].DailyEntryId, Amount = 500m, PaymentDate = DateTime.UtcNow.AddDays(-1), InvoiceNumber = "DE-001" },
                new Payment { DailyEntryId = entries[2].DailyEntryId, Amount = 450m, PaymentDate = DateTime.UtcNow.AddDays(-3), InvoiceNumber = "DE-002" },
                new Payment { DailyEntryId = entries[4].DailyEntryId, Amount = 700m, PaymentDate = DateTime.UtcNow.AddDays(-2), InvoiceNumber = "DE-003" }
            };

            context.Payments.AddRange(payments);
            context.SaveChanges();
        }
    }
}