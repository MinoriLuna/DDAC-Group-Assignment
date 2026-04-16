using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    // These tell C# which tables exist in your database
    public DbSet<User> Users { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<MedicalDocument> Documents { get; set; }

    public DbSet<Prescription> Prescriptions { get; set; }  

    //Status making numbers into text
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // This magic line ensures that our C# Enum (Pending, Confirmed, etc.) 
        // is saved into the Supabase 'status' column as a STRING (text).
        modelBuilder.Entity<Appointment>()
            .Property(a => a.Status)
            .HasConversion<string>();
    }
}