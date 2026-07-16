using CustomerManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CustomerManagement.Infrastructure.Data
{
    /// Design-time factory used by Entity Framework CLI tools (migrations, scaffolding).
    /// This class is NOT used at runtime - only during 'dotnet ef' commands.
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        /// Creates a configured AppDbContext instance for design-time operations.
        /// Resolves the correct database path whether the command is run from the
        /// solution root or from inside the Infrastructure project folder.
        public AppDbContext CreateDbContext(string[] args)
        {
            var root = Directory.GetCurrentDirectory();

            // Resolve the Infrastructure project folder from either the solution root
            // or from within the Infrastructure project directory itself
            var projectFolder = Path.Combine(root, "CustomerManagement.Infrastructure");

            if (!Directory.Exists(projectFolder))
            {
                // Command was run from inside the Infrastructure project - use current dir
                projectFolder = root;
            }

            var dbPath = Path.Combine(projectFolder, "database", "customer_management.db");

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlite(
                $"Data Source={dbPath}",
                x => x.MigrationsAssembly("CustomerManagement.Infrastructure")
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}