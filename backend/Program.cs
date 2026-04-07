var builder = WebApplication.CreateBuilder(args);

// 1. THE BOUNCER: Tell C# to allow Next.js (Port 3000) to talk to it
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Your React app's address
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2. Enable Controllers (The Traffic Cops)
builder.Services.AddControllers();

var app = builder.Build();

// 3. Turn the Bouncer on
app.UseCors("AllowNextJs");
// 4. Turn the Traffic Cops on
app.MapControllers();

app.Run();