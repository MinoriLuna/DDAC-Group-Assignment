using Microsoft.EntityFrameworkCore;
using backend.Models; // This imports the User blueprint we just made

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options)
    {
    }

    // This specifically tells C#: "We have a table in Supabase called 'Users' 
    // and it uses the 'User' blueprint."
    public DbSet<User> Users { get; set; }
}