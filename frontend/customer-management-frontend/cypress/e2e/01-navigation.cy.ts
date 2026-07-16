// cypress/e2e/01-navigation.cy.ts
// Tests for the navigation bar and routing between pages

describe('Navigation', () => {

  beforeEach(() => {
    // Intercept the locations API so dashboard loads without the real backend
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' }).as('getLocations');
    cy.intercept('GET', '**/api/client', { body: [] }).as('getClients');
    cy.intercept('GET', '**/api/dailyEntry/getAll', { body: [] }).as('getDailyEntries');
    cy.intercept('GET', '**/api/payment', { body: [] }).as('getPayments');
  });

  it('should load the dashboard on the root URL', () => {
    cy.visit('/');
    cy.url().should('include', '/dashboard');
  });

  it('should display the navbar with all 9 buttons', () => {
    cy.visit('/dashboard');
    cy.get('.location-navbar button').should('have.length', 9);
  });

  it('should highlight the Dashboard button as active when on the dashboard', () => {
    cy.visit('/dashboard');
    cy.get('.location-navbar button').contains('Dashboard').should('have.class', 'active');
  });

  it('should navigate to Riverside when clicking the Riverside button', () => {
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });

    cy.visit('/dashboard');
    cy.get('.location-navbar button').contains('Riverside').click();

    cy.url().should('include', '/locations/riverside');
    cy.wait('@getRiverside');
  });

  it('should highlight the Riverside button as active when on the Riverside page', () => {
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });

    cy.visit('/locations/riverside');
    cy.get('.location-navbar button').contains('Riverside').should('have.class', 'active');
  });

  it('should navigate to each location page without errors', () => {
    const locations = [
      { key: 'riverside',             api: 'client/location/riverside',              fixture: 'riverside-clients.json' },
      { key: 'fairview',                api: 'dailyEntry/location/fairview',             fixture: 'fairview-entries.json' },
    ];

    locations.forEach(({ key, api, fixture }) => {
      cy.intercept('GET', `**/api/${api}`, { fixture }).as(`get-${key}`);
      cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
      cy.visit(`/locations/${key}`);
      cy.get('.table-wrapper', { timeout: 10000 }).should('be.visible');
    });
  });

  it('should show "Unknown location" for an invalid location key', () => {
    cy.visit('/locations/invalid-location');
    cy.get('.table-wrapper h2').should('contain', 'Unknown location');
  });

  it('should navigate back to dashboard from a location page', () => {
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client', { body: [] });
    cy.intercept('GET', '**/api/dailyEntry/getAll', { body: [] });
    cy.intercept('GET', '**/api/payment', { body: [] });

    cy.visit('/locations/riverside');
    cy.get('.location-navbar button').contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
  });
});
