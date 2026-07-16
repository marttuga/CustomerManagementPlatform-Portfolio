using CustomerManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using CustomerManagement.Api.Mappings;
using CustomerManagement.Domain.Models;

var builder = WebApplication.CreateBuilder(args);

// --- DATABASE ---
// In production the database lives on the USB pen drive, next to the executable.
// The path is resolved relative to the content root so it works from any PC.
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "database", "customer_management.db");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(
        $"Data Source={Path.GetFullPath(dbPath)}",
        sqliteOptions => sqliteOptions.MigrationsAssembly("CustomerManagement.Infrastructure")
    );

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging()
               .EnableDetailedErrors()
               .LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// --- AUTOMAPPER ---
builder.Services.AddAutoMapper(typeof(MappingProfile));

// --- CONTROLLERS + JSON ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// --- CORS ---
// In production the Angular app is served by .NET itself on the same origin,
// so CORS is only needed in development (ng serve on port 4200).
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// --- SWAGGER (development only) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Customer Management Platform API",
        Version = "v1",
        Description = "API for managing clients, payments and reports."
    });
});

var app = builder.Build();

// --- SWAGGER UI (development only) ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Customer Management Platform API v1");
    });
}

// --- SERVE ANGULAR STATIC FILES (production only) ---
// In production, .NET serves the compiled Angular app from the wwwroot folder.
// This means only ONE process needs to run - no separate ng serve needed.
if (app.Environment.IsProduction())
{
    app.UseDefaultFiles();   // serves index.html for /
    app.UseStaticFiles();    // serves JS, CSS, assets from wwwroot
}

app.UseCors("AllowAngularApp");
app.UseAuthorization();
app.MapControllers();

// --- ANGULAR CLIENT-SIDE ROUTING FALLBACK ---
// Any route not matched by the API (e.g. /dashboard, /locations/riverside)
// should return index.html so Angular's router can handle it.
if (app.Environment.IsProduction())
{
    app.MapFallbackToFile("index.html");
}

// --- DATABASE SEEDER ---
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    var locations = builder.Configuration.GetSection("Locations").Get<List<Location>>()
        ?? new List<Location>();

    // Always: applies migrations and seeds the 8 locations
    DbSeeder.Seed(dbContext, locations);

    // Development only: seeds fake clients, payments and daily entries for testing
    if (app.Environment.IsDevelopment())
    {
        DbSeeder.SeedDevelopmentData(dbContext);
    }
}

app.Run();