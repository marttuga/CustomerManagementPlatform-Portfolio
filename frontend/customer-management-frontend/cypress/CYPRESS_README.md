# Cypress E2E Tests - Customer Management Platform

End-to-end tests for the Customer Management Platform UI using [Cypress](https://www.cypress.io/).

---

## Setup

### 1. Install Cypress

Inside the frontend folder:

```bash
cd frontend/customer-management-frontend
npm install --save-dev cypress @types/cypress
```

### 2. Copy configuration files

Copy these files to the frontend root (`frontend/customer-management-frontend/`):

```
cypress.config.ts          → frontend/customer-management-frontend/
tsconfig.cypress.json      → frontend/customer-management-frontend/
cypress/
  support/
    commands.ts
    e2e.ts
  fixtures/
    locations.json
    riverside-clients.json
    fairview-entries.json
  e2e/
    01-navigation.cy.ts
    02-dashboard.cy.ts
    03-table-display-search.cy.ts
    04-client-crud.cy.ts
    05-duplicate-detection.cy.ts
    06-payments-daily-entries.cy.ts
    07-report-generation.cy.ts
    08-error-handling.cy.ts
```

### 3. Add scripts to package.json

```json
"scripts": {
  "cy:open": "cypress open",
  "cy:run": "cypress run",
  "cy:run:headed": "cypress run --headed"
}
```

---

## Running Tests

### Interactive mode (recommended for development)

```bash
# Start the Angular dev server first
ng serve

# Then in a new terminal, open Cypress
npm run cy:open
```

Cypress opens a browser window where you can run individual test files.

### Headless mode (for CI or full runs)

```bash
# Backend and frontend must be running
npm run cy:run
```

---

## Test Files Overview

| File | What it tests |
|------|--------------|
| `01-navigation.cy.ts` | Navbar links, routing, active states |
| `02-dashboard.cy.ts` | Dashboard cards, charts, API calls |
| `03-table-display-search.cy.ts` | Table data display, search/filter, sort |
| `04-client-crud.cy.ts` | Add, edit, delete clients (Riverside) |
| `05-duplicate-detection.cy.ts` | All duplicate detection scenarios |
| `06-payments-daily-entries.cy.ts` | Payment registration, daily entry CRUD |
| `07-report-generation.cy.ts` | Report popover, API call, empty result |
| `08-error-handling.cy.ts` | API errors, network failures, edge cases |

---

## How it works

All tests use `cy.intercept()` to mock API responses - **the real backend does not need to be running** for most tests. Fixtures in `cypress/fixtures/` provide consistent test data.

Tests that verify the full request/response cycle (e.g. checking the exact URL and body of a POST request) use `cy.wait('@alias')` to inspect the intercepted request.

---

## Important Notes

- Tests run against `http://localhost:4200` (Angular dev server must be running)
- The backend is mocked - no real data is modified during tests
- Screenshots of failed tests are saved to `cypress/screenshots/`
- Videos of all runs are saved to `cypress/videos/`
