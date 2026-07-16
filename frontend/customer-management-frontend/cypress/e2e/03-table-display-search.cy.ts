// cypress/e2e/03-table-display-search.cy.ts
// Tests for the generic table - data display, search and sort

describe('Table - Display and Search', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');
    cy.waitForTable();
  });

  // ── DATA DISPLAY ────────────────────────────────────────────

  it('should display the location title in the table header', () => {
    cy.get('.table-header h2').should('contain', 'Riverside');
  });

  it('should display the correct column headers for Riverside', () => {
    const expectedColumns = [
      'Patient', 'Consultation', 'SCML Code', 'Health Insurance',
      'Surgery', 'Status', 'Payment', 'Amount', 'Invoice Number', 'Notes', 'Actions'
    ];
    cy.get('.styled-table thead th').each(($th, index) => {
      if (index < expectedColumns.length) {
        cy.wrap($th).should('contain', expectedColumns[index]);
      }
    });
  });

  it('should render one row per payment for John Smith', () => {
    cy.get('.styled-table tbody tr').first().should('contain', 'John Smith');
  });

  it('should show Pending status for clients with no payment', () => {
    cy.get('.styled-table tbody tr')
      .contains('Mary Johnson')
      .closest('tr')
      .should('contain', 'Pending');
  });

  it('should show Paid status for clients with a payment', () => {
    cy.get('.styled-table tbody tr')
      .contains('John Smith')
      .closest('tr')
      .should('contain', 'Paid');
  });

  it('should display the invoice number for paid clients', () => {
    cy.get('.styled-table tbody tr')
      .contains('John Smith')
      .closest('tr')
      .should('contain', 'INV-001');
  });

  it('should display the amount for paid clients', () => {
    cy.get('.styled-table tbody tr')
      .contains('John Smith')
      .closest('tr')
      .should('contain', '300');
  });

  // ── SEARCH ──────────────────────────────────────────────────

  it('should render the search input', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should filter rows when searching by patient name', () => {
    cy.searchTable('John');
    cy.get('.styled-table tbody tr').should('have.length', 1);
    cy.get('.styled-table tbody tr').should('contain', 'John Smith');
  });

  it('should filter rows case-insensitively', () => {
    cy.searchTable('john');
    cy.get('.styled-table tbody tr').should('have.length', 1);
    cy.get('.styled-table tbody tr').should('contain', 'John Smith');
  });

  it('should filter rows by SCML code', () => {
    cy.searchTable('000101');
    cy.get('.styled-table tbody tr').should('have.length', 1);
    cy.get('.styled-table tbody tr').should('contain', 'Mary Johnson');
  });

  it('should filter rows by payment status', () => {
    cy.searchTable('Pending');
    cy.get('.styled-table tbody tr').each(($row) => {
      cy.wrap($row).should('contain', 'Pending');
    });
  });

  it('should filter rows by invoice number', () => {
    cy.searchTable('INV-001');
    cy.get('.styled-table tbody tr').should('have.length', 1);
  });

  it('should show all rows when search is cleared', () => {
    cy.searchTable('John');
    cy.get('.styled-table tbody tr').should('have.length', 1);
    cy.clearSearch();
    // 3 clients: John (1 payment) + Mary (pending) + Richard (pending) = 3 rows
    cy.get('.styled-table tbody tr').should('have.length', 3);
  });

  it('should show no rows for a search term that matches nothing', () => {
    cy.searchTable('zzz-no-match-zzz');
    cy.get('.styled-table tbody tr').should('have.length', 0);
  });

  it('should filter rows by notes field', () => {
    cy.searchTable('Urgent');
    cy.get('.styled-table tbody tr').should('have.length', 1);
    cy.get('.styled-table tbody tr').should('contain', 'Richard Turner');
  });

  // ── SORT ────────────────────────────────────────────────────

  it('should have sort arrows on sortable columns', () => {
    cy.get('.arrow-btn').should('have.length.greaterThan', 0);
  });

  it('should sort by Patient name ascending', () => {
    cy.get('.styled-table thead th').first().find('.arrow-btn').first().click();
    cy.get('.styled-table tbody tr').first().should('contain', 'John Smith');
  });

  it('should reset sort when clicking the column label', () => {
    cy.get('.arrow-btn').first().click();
    cy.get('.header-label').first().click();
    cy.get('.arrow-btn.active').should('not.exist');
  });
});

// ── Daily Entry Table ────────────────────────────────────────
describe('Table - Daily Entry Display (Fairview)', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' });
    cy.intercept('GET', '**/api/dailyEntry/location/fairview', { fixture: 'fairview-entries.json' }).as('getFairview');
    cy.visit('/locations/fairview');
    cy.wait('@getFairview');
    cy.waitForTable();
  });

  it('should display the Fairview table title', () => {
    cy.get('.table-header h2').should('contain', 'Fairview');
  });

  it('should display Work Date column instead of Patient column', () => {
    cy.get('.styled-table thead th').first().should('contain', 'Work Date');
    cy.get('.styled-table thead th').should('not.contain', 'Patient');
    cy.get('.styled-table thead th').should('not.contain', 'SCML Code');
  });

  it('should show Paid status for entries with a payment', () => {
    cy.get('.styled-table tbody tr').first().should('contain', 'Paid');
  });

  it('should show Pending status for entries with no payment', () => {
    cy.get('.styled-table tbody tr').last().should('contain', 'Pending');
  });
});