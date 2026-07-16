describe('Error Handling', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');
    cy.waitForTable();
  });

  it('should show an error message when saving fails due to a network error', () => {
    cy.intercept('POST', '**/api/client', { forceNetworkError: true });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('Test Error');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-05-01');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('000888');

    cy.saveRow();
    cy.get('.message').should('contain', '❌');
  });

  it('should show an error message when save returns 500', () => {
    cy.intercept('POST', '**/api/client', { statusCode: 500, body: 'Internal Server Error' }).as('serverError');
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('Error 500');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-05-01');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('000777');

    cy.saveRow();
    cy.wait('@serverError');
    cy.get('.message').should('contain', '❌');
  });

  it('should show an error if the report API returns 500', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/**', { statusCode: 500, body: 'Error' }).as('reportError');
    cy.get('.action-btn.report').click();
    cy.get('.confirm-report-btn').click();
    cy.wait('@reportError');
    cy.get('.message').should('contain', 'Error fetching report data');
  });

  it('should re-enable the Save button after a failed save', () => {
    cy.intercept('POST', '**/api/client', { statusCode: 500, body: 'Error' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('Test');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-05-01');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('000111');

    cy.saveRow();
    cy.get('.styled-table tbody tr:first-child button').contains('Save').should('not.be.disabled');
  });
});

// ─────────────────────────────────────────────────────────────
describe('Edge Cases', () => {

  it('should display an empty table gracefully when API returns empty array', () => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { body: [] }).as('emptyRiverside');

    cy.visit('/locations/riverside');
    cy.wait('@emptyRiverside');

    cy.get('.styled-table tbody tr').should('have.length', 0);
    cy.get('.table-wrapper').should('be.visible');
  });

  it('should handle a large list of clients without crashing', () => {
    const manyClients = Array.from({ length: 50 }, (_, i) => ({
      clientId: i + 1, name: `Patient ${i + 1}`,
      scmlCode: String(i + 100).padStart(6, '0'),
      surgeryType: 'Septoplasty', insuranceType: 'MediCare Plus',
      locationId: 1, locationName: 'Riverside', notes: '',
      clientDate: '2026-01-01T00:00:00Z', payments: []
    }));

    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { body: manyClients }).as('manyClients');

    cy.visit('/locations/riverside');
    cy.wait('@manyClients');
    cy.get('.styled-table tbody tr').should('have.length', 50);
  });

  it('should format patient name to Title Case on blur', () => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');

    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');

    cy.clickAddPayment();
    // col 0 = Patient name
    const nameInput = cy.get('.styled-table tbody tr:first-child td').eq(0).find('input');
    nameInput.type('RENÉ GARCÍA');
    nameInput.blur();
    nameInput.should('have.value', 'René García');
  });

  it('should switch location data correctly when navigating between pages', () => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.intercept('GET', '**/api/dailyEntry/location/fairview', { fixture: 'fairview-entries.json' }).as('getFairview');

    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');
    cy.get('.table-header h2').should('contain', 'Riverside');

    cy.get('.location-navbar button').contains('Fairview').click();
    cy.wait('@getFairview');
    cy.get('.table-header h2').should('contain', 'Fairview');
    cy.get('.styled-table thead th').first().should('contain', 'Work Date');
  });

  it('should keep Add Payment and Report buttons always visible', () => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');

    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');

    cy.contains('button', '+ Add Payment').should('be.visible');
    cy.get('.action-btn.report').should('be.visible');
  });
});