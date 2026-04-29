using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services.Interfaces;
using backend.Services.Mocks; // For Mock Services
using backend.Services.AWS; // For AWS Services
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.AspNetCore;

// Trace all AWS SDK calls (S3, SNS, Comprehend) with X-Ray
AWSSDKHandler.RegisterXRayForAllServices();

var builder = WebApplication.CreateBuilder(args);

// CloudWatch logging
builder.Logging.AddAWSProvider();

// Database Registry
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS Registry
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

// Auth Registry
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
        // This tells C# to ALWAYS send Enums as "Pending" instead of 0
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Mock Implementations
//builder.Services.AddScoped<IStorageService, MockStorageService>();
//builder.Services.AddScoped<INotificationService, MockNotificationService>();

//AWS Services
builder.Services.AddScoped<IStorageService, S3StorageService>();
builder.Services.AddScoped<INotificationService, SnsNotificationService>();
builder.Services.AddScoped<EventBridgeService>();
builder.Services.AddScoped<ComprehendService>();

// Build
var app = builder.Build();

app.UseCors("AllowNextJs");

app.UseXRay("MediCare+");

// Serve Next.js static export from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback: any unmatched route serves the Next.js shell
app.MapFallbackToFile("index.html");

app.Run();