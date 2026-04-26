# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MediCare+** — a full-stack healthcare management platform for patients, doctors, and receptionists. Built as a DDAC group assignment.

## Commands

### Frontend (Next.js — run from repo root)
```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Backend (ASP.NET Core — run from `backend/`)
```bash
dotnet run                  # Dev server at http://localhost:5230
dotnet build                # Build
dotnet ef database update   # Apply EF Core migrations to PostgreSQL
```

Swagger UI is available at `http://localhost:5230/swagger` in development.

## Architecture

Two independent apps that communicate over HTTP:

- **`app/`** — Next.js 15 frontend (App Router, JS not TS, Tailwind CSS 4). No dedicated API layer; pages fetch directly from the backend using `fetch()` with `Authorization: Bearer {token}` headers. JWT is stored in `localStorage` after login.
- **`backend/`** — ASP.NET Core 8 Web API. Entity Framework Core 8 with PostgreSQL (hosted on Supabase). Swagger enabled in development.

### Backend structure
```
Controllers/Auth/       Login, Register
Controllers/Doctor/     Doctor-scoped endpoints
Controllers/Patient/    Appointment booking, documents, profile
Models/                 EF Core entities (User, Appointment, Prescription, MedicalDocument)
Data/ApplicationDbContext.cs
Services/Interfaces/    IStorageService, INotificationService, IMessageQueue
Services/Mocks/         Default in-use stub implementations
Services/AWS/           Real S3/SNS/SQS (not enabled by default)
```

### Frontend structure
```
app/login, app/register    Auth pages
app/patient/**             Patient dashboard and sub-pages
app/doctor/**              Doctor dashboard and sub-pages
utils/constants.js         Appointment status constants
```

## Key Conventions

### Authentication
- `POST /api/auth/login` returns a JWT. The frontend stores it in `localStorage`.
- Protected endpoints require `[Authorize]`. Claims include `userId`, `email`, `role`.
- Role values: `Patient`, `Doctor`, `Receptionist`, `Admin`.

### Service layer (AWS vs. Mock)
AWS services (S3, SNS, SQS) have mock implementations active by default. To switch to real AWS, update the service registrations in `Program.cs`. Mock services are in `Services/Mocks/`, real ones in `Services/AWS/`.

### Database
- PostgreSQL via Supabase. Connection string is in `appsettings.json`.
- Enums serialized as strings in API responses (`System.Text.Json` configured in `Program.cs`).
- Schema migrations are EF Core code-first — always run `dotnet ef database update` after pulling model changes.

### CORS
Backend allows `http://localhost:3000` only (configured in `Program.cs`). Update `AllowedOrigins` in `appsettings.json` for other environments.

## Data Model Summary

| Table | Key columns |
|---|---|
| `users` | `userid` (UUID PK), `role`, `specialization`/`licenseNumber`/`department`/`isavailable` (doctor-only) |
| `appointments` | `patientid`, `doctorid`, `appointmentdate` (DateOnly), `appointmenttime` (TimeOnly), `status` (enum) |
| `prescriptions` | `appointmentid`, `doctorid`, `patientid`, `medicines` (comma-separated string) |
| `documents` | `patientid`, `fileurl` (S3 URL), `documenttype`, `filesize` |

## API Route Summary

| Prefix | Controller | Notes |
|---|---|---|
| `/api/auth` | AuthController | Public — register, login |
| `/api/appointment` | AppointmentController | Patient booking flow |
| `/api/doctor` | DoctorController | Doctor profile, appointments, patients, prescriptions |
| `/api/documents` | DocumentController | S3-backed file upload/list |
| `/api/profile` | ProfileController | Generic user profile get/update |
