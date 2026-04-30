using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services.Interfaces;
using backend.Services.Mocks;
using backend.Services.AWS;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Amazon.S3;
using Amazon.SimpleNotificationService;
using Amazon.SQS; // Added for SQS
using Amazon.Comprehend;
using Amazon.EventBridge;
using Amazon.Runtime;
using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.AspNetCore;

// Trace all AWS SDK calls (S3, SNS, SQS, SES, Comprehend) with X-Ray
AWSSDKHandler.RegisterXRayForAllServices();

var builder = WebApplication.CreateBuilder(args);

// CloudWatch logging
builder.Logging.AddAWSProvider();

// --- 1. AWS SDK REGISTRY ---
var awsOptions = builder.Configuration.GetAWSOptions();
builder.Services.AddDefaultAWSOptions(awsOptions);

builder.Services.AddAWSService<IAmazonEventBridge>();
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSimpleNotificationService>();
builder.Services.AddAWSService<IAmazonSQS>(); // Added: Registered SQS Client

// Comprehend uses a separate personal account key (lab role lacks permission)
builder.Services.AddSingleton<IAmazonComprehend>(_ =>
{
    var config = builder.Configuration;
    var credentials = new BasicAWSCredentials(
        config["AWS:ComprehendAccessKey"],
        config["AWS:ComprehendSecretKey"]
    );
    return new AmazonComprehendClient(credentials, Amazon.RegionEndpoint.USEast1);
});

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
builder.Services.AddScoped<IStorageService, S3StorageService>();
builder.Services.AddScoped<INotificationService, SnsNotificationService>();
builder.Services.AddScoped<EventBridgeService>();
builder.Services.AddScoped<ComprehendService>();
builder.Services.AddHostedService<EmailWorker>(); 
builder.Services.AddScoped<ISqsService, SqsService>();

// --- 6. PIPELINE BUILD ---
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