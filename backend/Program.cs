using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services.Interfaces;
using backend.Services.Mocks; 
using backend.Services.AWS; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Amazon.S3; // Added
using Amazon.SimpleNotificationService; // Added
using Amazon.Comprehend; // Added
using Amazon.EventBridge; // Added

var builder = WebApplication.CreateBuilder(args);

// --- 1. AWS SDK REGISTRY (The "Keyless" Entry) ---
// This tells the app to look for the LabInstanceProfile automatically
var awsOptions = builder.Configuration.GetAWSOptions();
builder.Services.AddDefaultAWSOptions(awsOptions);

// Register the actual AWS Clients so they can be injected into your services
builder.Services.AddAWSService<IAmazonEventBridge>();
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSimpleNotificationService>();
builder.Services.AddAWSService<IAmazonComprehend>();

// --- 2. DATABASE REGISTRY ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// --- 3. CORS REGISTRY ---
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(allowedOrigins) 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// --- 4. AUTH REGISTRY ---
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
.AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// --- 5. CUSTOM SERVICES REGISTRY ---
// These now depend on the AWS Clients registered in Step 1
builder.Services.AddScoped<IStorageService, S3StorageService>();
builder.Services.AddScoped<INotificationService, SnsNotificationService>();
builder.Services.AddScoped<EventBridgeService>();
builder.Services.AddScoped<ComprehendService>();

// --- 6. PIPELINE BUILD ---
var app = builder.Build();

app.UseCors("AllowNextJs");

// Serve Next.js static export from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback: any unmatched route serves the Next.js shell
app.MapFallbackToFile("index.html");

app.Run();