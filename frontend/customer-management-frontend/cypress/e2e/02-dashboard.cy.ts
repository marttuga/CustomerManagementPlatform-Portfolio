// cypress/e2e/02-dashboard.cy.ts
// Tests for the dashboard page - summary cards and charts

describe('Dashboard', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' }).as('getLocations');
    cy.intercept('GET', '**/api/client', { body: [] }).as('getClients');
    cy.intercept('GET', '**/api/dailyEntry/getAll', { body: [] }).as('getDailyEntries');
    cy.intercept('GET', '**/api/payment', { body: [] }).as('getPayments');
    cy.visit('/dashboard');
  });

  it('should display the Financial Dashboard heading', () => {
    cy.get('.dashboard-header h1').should('contain', 'Financial Dashboard');
  });

  it('should display 3 summary cards', () => {
    cy.get('.stats-cards .card').should('have.length', 3);
  });

  it('should display Total Payments card', () => {
    cy.get('.stats-cards .card').contains('Total Payments').should('exist');
  });

  it('should display Pending Payments card', () => {
    cy.get('.stats-cards .card').contains('Pending Payments').should('exist');
  });

  it('should display Total Records card', () => {
    cy.get('.stats-cards .card').contains('Total Records').should('exist');
  });

  it('should show zero values when no data is returned', () => {
    cy.get('.stats-cards .card p').each(($card) => {
      cy.wrap($card).should('contain', '0');
    });
  });

  it('should render two chart canvases', () => {
    cy.get('.charts-section canvas').should('have.length', 2);
  });

  it('should call all 4 API endpoints on load', () => {
    cy.wait('@getLocations');
    cy.wait('@getClients');
    cy.wait('@getDailyEntries');
    cy.wait('@getPayments');
  });

  it('should show correct total payments when data is loaded', () => {
    cy.intercept('GET', '**/api/client', {
      body: [
        {
          clientId: 1, name: 'John Smith', locationId: 1,
          clientDate: '2026-01-01',
          payments: [{ paymentId: 1, clientId: 1, amount: 300, paymentDate: '2026-01-10' }]
        },
        {
          clientId: 2, name: 'Mary Davis', locationId: 1,
          clientDate: '2026-01-05',
          payments: []
        }
      ]
    }).as('getClientsWithData');
    cy.intercept('GET', '**/api/payment', {
      body: [{ paymentId: 1, clientId: 1, amount: 300, paymentDate: '2026-01-10' }]
    }).as('getPaymentsWithData');

    cy.visit('/dashboard');
    cy.wait('@getClientsWithData');
    cy.wait('@getPaymentsWithData');

    // 1 payment registered → Total Payments card shows 1
    cy.get('.stats-cards .card').contains('Total Payments')
      .parent().find('p').should('contain', '1');

    // 1 client with no payment → Pending shows 1
    cy.get('.stats-cards .card').contains('Pending Payments')
      .parent().find('p').should('contain', '1');
  });
});