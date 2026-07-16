# Customer Management Platform

A full-stack web application for managing patients, daily work entries, payments and monthly reports across multiple clinical locations. Built with Angular 16 (frontend) and ASP.NET Core 9 with SQLite (backend).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Business Logic](#business-logic)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [Database Model](#database-model)
7. [API Reference](#api-reference)
8. [Frontend Structure](#frontend-structure)
9. [Configuration](#configuration)
10. [Running the Project](#running-the-project)
11. [Running Tests](#running-tests)
12. [Production Deployment](#production-deployment)

---

## Project Overview

The Customer Management Platform is a desktop-class web application designed for a healthcare provider to manage clinical work across 8 locations. The application tracks patients, records daily work, registers payments and generates pending items reports as downloadable PDFs.

---

## Business Logic

### Two Billing Models

The 8 locations are split into two distinct billing models that affect how data is stored, displayed and reported:

**Client Model - Locations 1 to 3**

| ID | Location | Key |
|----|----------|-----|
| 1 | Riverside | `riverside` |
| 2 | Hillcrest | `hillcrest` |
| 3 | Oakdale | `oakdale` |

These locations work with individual patient records. Each client has a name, consultation date, surgery type, insurance type and optional notes. Riverside additionally requires a 6-digit SCML code for each patient. A payment is registered per client.

**Daily Entry Model - Locations 4 to 8**

| ID | Location | Key |
|----|----------|-----|
| 4 | Fairview | `fairview` |
| 5 | Northgate | `northgate` |
| 6 | Sunview | `sunview` |
| 7 | Elmwood | `elmwood` |
| 8 | Ashford | `ashford` |

These locations work with daily work entries. Instead of individual patients, a single entry is registered per working day at a location. A payment is registered per daily entry.

### Payment Logic

A payment is always linked to **either** a Client **or** a Daily Entry - never both, never neither. This constraint is enforced at the model level (via `IValidatableObject`), at the DTO level (via validation annotations) and at the controller level (explicit checks before saving).

A record without a payment is considered **Pending**. A record with a payment is considered **Paid**. The dashboard shows totals and a breakdown of pending items per location.

### Duplicate Detection

To prevent accidental duplicate entries, the system applies location-specific duplicate detection rules both on the frontend (before sending to the API) and on the backend (as a secondary check returning HTTP 409 Conflict):

- **Riverside**: matches on Name + SCML Code + Date
- **Hillcrest**: matches on Name + Surgery Type + Date
- **Oakdale**: matches on Name + Date
- **Daily Entry locations**: only one entry allowed per location per date

When a duplicate is detected, the user is offered the option to edit the existing record rather than creating a new one.

### Report Generation

Each location page has a Report button that opens a date selector (month + year). When confirmed, the backend queries all pending records (those without a payment) for the selected period and returns them. The frontend then generates and downloads a PDF using `html2pdf.js`.

The report format differs by billing model:
- **Client model**: shows patient name, SCML code (Riverside only), surgery type, insurance type, consultation date and notes
- **Daily entry model**: shows work date and notes

Selecting month 13 generates a full annual report.

### Locations are Fixed

Locations are seeded once at first startup from `DbSeeder.cs` and are not editable by the end user. Adding or removing a location requires a SQL script run directly on the database file by the developer.

---

## Project Structure

```
CustomerManagementPlatform/
│
├── backend/
│   ├── CustomerManagement.Api/
│   │   ├── Controllers/          # HTTP endpoints (Client, DailyEntry, Location, Payment, Report)
│   │   ├── DTOs/                 # Data Transfer Objects for each entity
│   │   │   ├── Client/
│   │   │   ├── DailyEntry/
│   │   │   ├── Location/
│   │   │   ├── Payment/
│   │   │   └── ReportHistory/
│   │   ├── Mappings/             # AutoMapper profile
│   │   ├── database/             # SQLite .db file
│   │   ├── appsettings.json      # Production configuration
│   │   ├── appsettings.Development.json
│   │   └── Program.cs            # App bootstrap and middleware
│   │
│   ├── CustomerManagement.Domain/
│   │   └── Models/               # Domain entities (Client, DailyEntry, Location, Payment, ReportHistory)
│   │
│   └── CustomerManagement.Infrastructure/
│       ├── Data/
│       │   ├── AppDbContext.cs           # EF Core DbContext
│       │   ├── AppDbContextFactory.cs    # Design-time factory for migrations
│       │   └── DbSeeder.cs               # Location seeding + dev data seeding
│       └── Migrations/                   # EF Core migration files
│
└── frontend/
    └── customer-management-frontend/
        ├── cypress/                      # E2E tests (Cypress)
        │   ├── e2e/                      # Test files (01 to 08)
        │   ├── fixtures/                 # Mock API responses
        │   └── support/                  # Custom commands and hooks
        └── src/
            └── app/
                ├── components/
                │   ├── dashboard/        # Main dashboard with charts
                │   └── shared/
                │       ├── navbar/       # Top navigation bar
                │       ├── location-base/    # Shell for location pages
                │       └── table-generic/    # Reusable data table
                ├── config/
                │   ├── location-columns.config.ts   # Column definitions per location
                │   └── medical-data.config.ts       # Surgery and insurance type lists
                ├── errorInterceptor/     # Global HTTP error handler
                ├── models/               # TypeScript interfaces (per entity)
                ├── services/             # HTTP services (per entity)
                └── environments/         # environment.ts and environment.prod.ts
```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| ASP.NET Core | 9.0 | REST API framework |
| Entity Framework Core | 9.0 | ORM and migrations |
| SQLite | - | Embedded database |
| AutoMapper | - | Entity ↔ DTO mapping |
| Swagger / OpenAPI | - | API documentation (development only) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 16 | SPA framework |
| TypeScript | 5.1 | Language |
| Chart.js | 4.4 | Dashboard charts |
| html2pdf.js | 0.10 | PDF report generation |
| RxJS | 7.8 | Reactive HTTP and state |
| Karma + Jasmine | - | Unit testing |
| Cypress | 13 | End-to-end testing |

---

## Architecture

### Backend Architecture (3-Layer)

```
HTTP Request
    ↓
Controller (CustomerManagement.Api)
    - validates input via DTOs
    - checks business rules (duplicates, ownership)
    ↓
AppDbContext (CustomerManagement.Infrastructure)
    - EF Core queries with .Include() for related data
    ↓
SQLite Database
    ↓
Domain Models (CustomerManagement.Domain)
    - mapped to DTOs via AutoMapper before response
```

The solution uses a Clean Architecture approach with three projects:

- **Api** - controllers, DTOs, mappings, program entry point
- **Domain** - pure C# models with data annotations, no infrastructure dependencies
- **Infrastructure** - EF Core context, migrations, seeder

### Frontend Architecture

```
AppComponent (router-outlet)
    ├── DashboardComponent
    │       - loads all data via forkJoin
    │       - renders Chart.js pie + bar charts
    │
    └── LocationBaseComponent  (route: /locations/:locationKey)
            - reads locationKey from route
            - looks up column config from LOCATION_CONFIG
            ↓
        TableGenericComponent
                - loads clients OR daily entries based on location model
                - flattens entity + payments into table rows
                - handles inline editing, save, delete
                - generates PDF reports via ReportHistoryService
```

All HTTP calls go through the `errorInterceptor` which catches errors globally and logs them to the console.

---

## Database Model

```
Location
  └── id, name, key

Client  (LocationId FK → Location, SetNull on delete)
  └── id, name, scmlCode*, surgeryType, insuranceType, notes, clientDate, locationId
      * Required for Riverside only

DailyEntry  (LocationId FK → Location, Cascade on delete)
  └── id, workDate, notes, locationId

Payment  (ClientId? FK → Client, DailyEntryId? FK → DailyEntry, Cascade on delete)
  └── id, amount, paymentDate, invoiceNumber, clientId?, dailyEntryId?
      - exactly one of clientId or dailyEntryId must be set

ReportHistory  (no FK - standalone audit log)
  └── id, type, generatedAt, filePath?, filterCriteriaJson?
```

### Cascade Rules

- Deleting a **Location** sets `ClientId` to null on all its clients (records preserved) and cascade-deletes all its `DailyEntry` records
- Deleting a **Client** cascade-deletes all its `Payment` records
- Deleting a **DailyEntry** cascade-deletes all its `Payment` records

---

## API Reference

### Base URL

```
Development:  http://localhost:5201/api
Production:   http://localhost:5201/api  (same - runs locally on the operator's machine)
```

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/client` | All clients with payments |
| GET | `/api/client/{id}` | Single client |
| GET | `/api/client/location/{key}` | Clients by location key |
| POST | `/api/client` | Create client - returns 409 if duplicate |
| PUT | `/api/client/{id}` | Update client |
| DELETE | `/api/client/{id}` | Delete client and all payments |

### Daily Entries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dailyEntry/getAll` | All daily entries with payments |
| GET | `/api/dailyEntry/{id}` | Single daily entry |
| GET | `/api/dailyEntry/location/{key}` | Daily entries by location key |
| POST | `/api/dailyEntry` | Create entry - returns 409 if duplicate date |
| PUT | `/api/dailyEntry/{id}` | Update entry |
| DELETE | `/api/dailyEntry/{id}` | Delete entry and all payments |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payment` | All payments |
| GET | `/api/payment/{id}` | Single payment |
| GET | `/api/payment/client/{clientId}` | Payments for a client |
| GET | `/api/payment/dailyEntry/{dailyEntryId}` | Payments for a daily entry |
| POST | `/api/payment` | Create payment - returns 409 if duplicate |
| PUT | `/api/payment/{id}` | Update amount, date, invoice |
| DELETE | `/api/payment/{id}` | Delete payment |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/location` | All locations with counts |
| GET | `/api/location/{id}` | Single location |
| POST | `/api/location` | Create location (developer use only) |
| PUT | `/api/location/{id}` | Update location (developer use only) |
| DELETE | `/api/location/{id}` | Delete location (developer use only) |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/report` | Report history |
| GET | `/api/report/{id}` | Single record |
| POST | `/api/report` | Save report to history |
| DELETE | `/api/report/{id}` | Delete record |
| GET | `/api/report/generate-monthly/{locationId}?month=N&year=N` | Generate pending items report. Month 13 = full year |

---

## Frontend Structure

### Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | - | Redirects to `/dashboard` |
| `/dashboard` | `DashboardComponent` | Overview with charts |
| `/locations/:locationKey` | `LocationBaseComponent` | Location detail page |

### Column Configuration

Each location has a column definition in `location-columns.config.ts`. This defines which fields appear in the table, their labels, types (`text`, `date`, `dropdown`) and whether they are sortable. Dropdown fields use option lists from `medical-data.config.ts`.

### Table Row Flattening

The generic table receives either a list of `Client` or `DailyEntry` objects, each of which contains a nested `payments` array. The component flattens these into individual table rows - one row per payment, or one pending row if no payment exists. This allows the table to show payment details inline with the entity data.

---

## Configuration

### `appsettings.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=database/customer_management.db"
  },
  "AllowedOrigins": ["http://localhost:4200"]
}
```

### Angular Environments

**`environment.ts`** (development - `ng serve`):
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5201/api'
};
```

**`environment.prod.ts`** (production - `ng build`):
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:5201/api'
};
```

Both point to `localhost` because the application is designed to run entirely on a local machine.

---

## Running the Project

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- Angular CLI 16 (`npm install -g @angular/cli@16`)

### Backend

```bash
cd backend/CustomerManagement.Api
dotnet run
```

The API starts at `http://localhost:5201`. Swagger is available at `http://localhost:5201/swagger` in development mode.

On first run, the database migrations are applied automatically and the 8 locations are seeded. In development mode, test data (clients, daily entries, payments) is also seeded.

### Frontend

```bash
cd frontend/customer-management-frontend
npm install
ng serve
```

The app is available at `http://localhost:4200`.

---

## Running Tests

### Unit Tests (Karma + Jasmine)

```bash
cd frontend/customer-management-frontend
ng test
```

Tests use Karma + Jasmine. `HttpClientTestingModule` is used to mock HTTP calls - no real API requests are made during tests.

| File | What is tested |
|------|----------------|
| `client.service.spec.ts` | All 5 HTTP methods with correct URLs and payloads |
| `location.service.spec.ts` | All 5 HTTP methods |
| `payment.service.spec.ts` | All 7 HTTP methods |
| `reportHistory.service.spec.ts` | All 4 methods + monthly report query params |
| `navbar.component.spec.ts` | Component creation, button count, button labels |
| `dashboard.component.spec.ts` | Component creation, initial state, DOM elements |
| `location-base.component.spec.ts` | Route param resolution, config lookup, unknown location fallback |
| `table-generic.component.spec.ts` | Search filter, name formatting, dropdown logic, edit/cancel state, isDailyEntry |

### E2E Tests (Cypress)

End-to-end tests verify the full UI behaviour with all API calls mocked. The backend does **not** need to be running.

```bash
# Start the Angular dev server first
cd frontend/customer-management-frontend
ng serve

# Then in a new terminal, open Cypress
npm run cy:open

# Or run all tests headlessly
npm run cy:run
```

| File | What is tested |
|------|----------------|
| `01-navigation.cy.ts` | Navbar links, routing, active button states, unknown location handling |
| `02-dashboard.cy.ts` | Summary cards, chart canvases, API calls on load, correct totals |
| `03-table-display-search.cy.ts` | Column headers, Paid/Pending display, search by name/SCML/status/notes, sort |
| `04-client-crud.cy.ts` | Add row, SCML validation, Paid validation, create/edit/delete client, delete modals |
| `05-duplicate-detection.cy.ts` | Riverside/Hillcrest/Oakdale/daily entry duplicate rules, API 409 second layer |
| `06-payments-daily-entries.cy.ts` | Payment registration, Paid status validation, daily entry CRUD, delete flows |
| `07-report-generation.cy.ts` | Report popover, month/year selector, Full Year (month=13), empty result, error |
| `08-error-handling.cy.ts` | Network errors, 500 responses, large datasets, Title Case formatting, navigation |

> See [`CYPRESS_README.md`](frontend/customer-management-frontend/CYPRESS_README.md) for full setup details.

---

## Production Deployment

The application is designed to run locally, with no internet connection or external server required.

### Build the Frontend

```bash
cd frontend/customer-management-frontend
ng build --configuration production
```

Output is placed in `dist/customer-management-frontend/`.

### Run in Production

Set the environment to `Production` before running the backend:

```bash
set ASPNETCORE_ENVIRONMENT=Production
cd backend/CustomerManagement.Api
dotnet run
```

In production mode:
- Swagger UI is disabled
- Sensitive data logging is disabled
- The `DbSeeder` only seeds locations - test data is never inserted

### Adding or Removing a Location

Locations are managed directly via SQL on the SQLite database file:

```sql
-- Add a new location
INSERT INTO Locations (Name, Key) VALUES ('Example Town', 'example-town');

-- Remove a location with no associated clients
DELETE FROM Locations WHERE LocationId = 9;

-- Move clients to another location before removing
UPDATE Clients SET LocationId = 1 WHERE LocationId = 9;
DELETE FROM Locations WHERE LocationId = 9;
```

After adding a location, update `location-columns.config.ts` and `navbar.component.html` in the frontend to include the new location.
