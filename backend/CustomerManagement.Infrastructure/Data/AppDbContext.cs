using CustomerManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace CustomerManagement.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Client> Clients { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ReportHistory> ReportHistories { get; set; }
        public DbSet<DailyEntry> DailyEntries { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // CLIENT
            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasKey(c => c.ClientId);
                entity.Property(c => c.ClientDate).IsRequired();
                entity.Property(c => c.Name).IsRequired().HasMaxLength(150);
                entity.Property(c => c.SCMLCode).HasMaxLength(50);
                entity.Property(c => c.SurgeryType).HasMaxLength(100);
                entity.Property(c => c.InsuranceType).HasMaxLength(100);
                entity.Property(c => c.Notes).HasMaxLength(100);

                entity.HasOne(c => c.Location)
                      .WithMany(l => l.Clients)
                      .HasForeignKey(c => c.LocationId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // DAILY ENTRY
            modelBuilder.Entity<DailyEntry>(entity =>
            {
                entity.HasKey(d => d.DailyEntryId);
                entity.Property(d => d.WorkDate).IsRequired();
                entity.Property(d => d.Notes).HasMaxLength(100);

                entity.HasOne(d => d.Location)
                      .WithMany(l => l.DailyEntries)
                      .HasForeignKey(d => d.LocationId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // PAYMENT
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(p => p.PaymentId);

                entity.Property(p => p.Amount)
                      .HasColumnType("decimal(10,2)");

                // ALTERADO: De SetNull para Cascade para evitar pagamentos órfãos
                entity.HasOne(p => p.Client)
                      .WithMany(c => c.Payments)
                      .HasForeignKey(p => p.ClientId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.DailyEntry)
                      .WithMany(d => d.Payments)
                      .HasForeignKey(p => p.DailyEntryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // REPORT HISTORY
            modelBuilder.Entity<ReportHistory>(entity =>
            {
                entity.HasKey(r => r.ReportHistoryId);
                entity.Property(r => r.Type).IsRequired().HasMaxLength(100);
            });
        }
    }
}