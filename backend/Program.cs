using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Optional: If using Swagger

// 1. IMPORT YOUR FOLDER NAMESPACES
using backend.Data;
using backend.Services.Interfaces;
using backend.Services.Mocks;
using backend.Services.AWS; // Uncommented so the code is ready for Block B

var builder = WebApplication.CreateBuilder(args);

// --- DATABASE REGISTRY ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// --- CORS REGISTRY (Next.js Frontend) ---
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(allowedOrigins!) 
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// --- AUTH REGISTRY (JWT) ---
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

// --- CONTROLLERS & JSON CONFIG ---
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        // Ensures Enums (like "Pending") are sent as strings, not numbers
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// --- AWS SDK ENGINE REGISTRY (Uncomment when Lab is ON) ---
/*
builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
builder.Services.AddAWSService<Amazon.S3.IAmazonS3>();
builder.Services.AddAWSService<Amazon.SQS.IAmazonSQS>();
builder.Services.AddAWSService<Amazon.SimpleNotificationService.IAmazonSimpleNotificationService>();
*/

// --- SERVICE DI REGISTRY (The "Master Switch") ---

// BLOCK A: LOCAL MOCKS (Current Development)
builder.Services.AddScoped<IStorageService, MockStorageService>();
builder.Services.AddScoped<INotificationService, MockNotificationService>();
builder.Services.AddScoped<IMessageQueue, MockQueueService>();

// BLOCK B: REAL AWS (Uncomment for Final Demo/Lab)
/*
builder.Services.AddScoped<IStorageService, S3StorageService>();
builder.Services.AddScoped<INotificationService, SnsNotificationService>();
builder.Services.AddScoped<IMessageQueue, SqsQueueService>();
*/

var app = builder.Build();

// --- MIDDLEWARE PIPELINE ---

app.UseCors("AllowNextJs");

// Required to view mock uploads in your browser (localhost:5230/uploads/file.jpg)
app.UseStaticFiles(); 

app.UseAuthentication(); 
app.UseAuthorization();  

app.MapControllers();

app.Run();