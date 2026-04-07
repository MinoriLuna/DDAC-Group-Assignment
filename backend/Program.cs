using Microsoft.EntityFrameworkCore;
using backend.Data; // This tells C# where to find your Database Map

var builder = WebApplication.CreateBuilder(args);

// 1. DATABASE REGISTRY: Tell C# exactly how to connect to Supabase
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. CORS REGISTRY: Read the list of allowed URLs from the vault
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

// 3. THE BOUNCER: Setup the rules
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(allowedOrigins) 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. Enable Controllers (The Traffic Cops)
builder.Services.AddControllers();

var app = builder.Build();

// 5. Turn the Bouncer on
app.UseCors("AllowNextJs");

// 6. Turn the Traffic Cops on
app.MapControllers();

app.Run();