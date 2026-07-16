// cypress/e2e/07-report-generation.cy.ts
// Tests for the PDF report generation feature

describe('Report Generation', () => {

  const mockReportResponse = {
    locationName: 'Riverside',
    isRiverside: true,
    isDailyModel: false,
    monthYear: '03/2026',
    generatedAt: '15/03/2026 10:30',
    totalPendingItems: 2,
    data: [
      { name: 'Mary Johnson', scmlCode: '000101', surgeryType: 'Tonsillectomy', insuranceType: 'HealthGuard', date: '2026-02-10T00:00:00Z', notes: '' },
      { name: 'Richard Turner',  scmlCode: '000102', surgeryType: 'Rhinoplasty',    insuranceType: 'WellPoint', date: '2026-03-01T00:00:00Z', notes: 'Urgent' }
    ]
  };

  const emptyReportResponse = {
    locationName: 'Riverside',
    isRiverside: true,
    isDailyModel: false,
    monthYear: '01/2026',
    generatedAt: '15/03/2026 10:30',
    totalPendingItems: 0,
    data: []
  };

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');
    cy.waitForTable();
  });

  it('should display the Report button', () => {
    cy.get('.action-btn.report').should('be.visible').and('contain', 'Report');
  });

  it('should open the report popover when clicking the Report button', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-popover').should('be.visible');
  });

  it('should close the report popover when clicking the Report button again', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-popover').should('be.visible');
    cy.get('.action-btn.report').click();
    cy.get('.report-popover').should('not.exist');
  });

  it('should close the report popover when clicking outside', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-popover').should('be.visible');
    cy.get('.table-header h2').click();
    cy.get('.report-popover').should('not.exist');
  });

  it('should show a month selector in the popover', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-select').should('be.visible');
  });

  it('should show a year input in the popover', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-year-input').should('be.visible');
  });

  it('should show all 13 months including Full Year', () => {
    cy.get('.action-btn.report').click();
    cy.get('.report-select option').should('have.length', 13);
    cy.get('.report-select option').last().should('contain', 'Full Year');
  });

  it('should default to the current month and year', () => {
    const now = new Date();
    cy.get('.action-btn.report').click();
    cy.get('.report-select').should('have.value', String(now.getMonth() + 1));
    cy.get('.report-year-input').should('have.value', String(now.getFullYear()));
  });

  it('should show a Confirm button in the popover', () => {
    cy.get('.action-btn.report').click();
    cy.get('.confirm-report-btn').should('be.visible').and('contain', 'Confirm');
  });

  it('should call the correct API endpoint with month and year params', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/1?month=3&year=2026', {
      statusCode: 200, body: mockReportResponse
    }).as('generateReport');

    cy.get('.action-btn.report').click();
    cy.get('.report-select').select('3');
    cy.get('.report-year-input').clear().type('2026');
    cy.get('.confirm-report-btn').click();

    cy.wait('@generateReport');
  });

  it('should close the popover after clicking Confirm', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/**', { statusCode: 200, body: mockReportResponse });

    cy.get('.action-btn.report').click();
    cy.get('.confirm-report-btn').click();

    cy.get('.report-popover').should('not.exist');
  });

  it('should show informational message when no pending items found', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/**', {
      statusCode: 200, body: emptyReportResponse
    }).as('generateEmptyReport');

    cy.get('.action-btn.report').click();
    cy.get('.report-select').select('1');
    cy.get('.report-year-input').clear().type('2026');
    cy.get('.confirm-report-btn').click();

    cy.wait('@generateEmptyReport');
    cy.get('.message').should('contain', 'No pending items found');
  });

  it('should call the API with month=13 when Full Year is selected', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/1?month=13&year=2026', {
      statusCode: 200,
      body: { ...mockReportResponse, monthYear: 'Year 2026', totalPendingItems: 5 }
    }).as('generateAnnualReport');

    cy.get('.action-btn.report').click();
    cy.get('.report-select').select('13');
    cy.get('.report-year-input').clear().type('2026');
    cy.get('.confirm-report-btn').click();

    cy.wait('@generateAnnualReport');
  });

  it('should disable the Report button while loading', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/**', (req) => {
      req.reply({ delay: 1500, statusCode: 200, body: mockReportResponse });
    }).as('slowReport');

    cy.get('.action-btn.report').click();
    cy.get('.confirm-report-btn').click();

    cy.get('.action-btn.report').should('be.disabled');
    cy.wait('@slowReport');
    cy.get('.action-btn.report').should('not.be.disabled');
  });

  it('should show error message if the report API call fails', () => {
    cy.intercept('GET', '**/api/report/generate-monthly/**', {
      statusCode: 500, body: 'Internal server error'
    }).as('failedReport');

    cy.get('.action-btn.report').click();
    cy.get('.confirm-report-btn').click();

    cy.wait('@failedReport');
    cy.get('.message').should('contain', 'Error fetching report data');
  });
});