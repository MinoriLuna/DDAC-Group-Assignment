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
using Amazon.SQS;
using Amazon.Comprehend;
using Amazon.EventBridge;
using Amazon.Runtime;
using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AwsSdk;
using Amazon.XRay.Recorder.Handlers.AspNetCore;
using Microsoft.AspNetCore.StaticFiles;

// Trace all AWS SDK calls (S3, SNS, SQS, Comprehend) with X-Ray
AWSSDKHandler.RegisterXRayForAllServices();

var builder = WebApplication.CreateBuilder(args);

// CloudWatch & AWS Providers
builder.Logging.AddAWSProvider();
var awsOptions = builder.Configuration.GetAWSOptions();
builder.Services.AddDefaultAWSOptions(awsOptions);

// --- 1. AWS SERVICE REGISTRY ---
builder.Services.AddAWSService<IAmazonEventBridge>();
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddAWSService<IAmazonSimpleNotificationService>();
builder.Services.AddAWSService<IAmazonSQS>();

builder.Services.AddSingleton<IAmazonComprehend>(_ => {
    var config = builder.Configuration;
    var credentials = new BasicAWSCredentials(config["AWS:ComprehendAccessKey"], config["AWS:ComprehendSecretKey"]);
    return new AmazonComprehendClient(credentials, Amazon.RegionEndpoint.USEast1);
});

// --- 2. DB & AUTH REGISTRY ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[] { "http://localhost:3000" };
builder.Services.AddCors(options => {
    options.AddPolicy("AllowNextJs", policy => {
        policy.WithOrigins(allowedOrigins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "SecretKey"))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers().AddJsonOptions(opt => opt.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

// --- 3. CUSTOM SERVICES ---
builder.Services.AddScoped<IStorageService, S3StorageService>();
builder.Services.AddScoped<INotificationService, SnsNotificationService>();
builder.Services.AddScoped<EventBridgeService>();
builder.Services.AddScoped<ComprehendService>();
builder.Services.AddScoped<ISqsService, SqsService>();
//builder.Services.AddHostedService<EmailWorker>(); // For SQS/SES Background Processing

var app = builder.Build();

// --- 4. PIPELINE ---
app.UseCors("AllowNextJs");
app.UseXRay("MediCare+");

// 1. UseDefaultFiles MUST come before UseStaticFiles
app.UseDefaultFiles(); 

// 2. Use the MIME provider we built earlier
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".txt"] = "text/plain";
provider.Mappings[".json"] = "application/json";

app.UseStaticFiles(new StaticFileOptions { 
    ContentTypeProvider = provider 
});

app.UseRouting(); // Routing comes AFTER static files

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 3. The Fallback is the LAST line before Run
app.MapFallbackToFile("index.html"); 

app.Run();