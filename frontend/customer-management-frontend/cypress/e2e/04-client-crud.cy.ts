describe('Client CRUD - Riverside', () => {

  const createdClientResponse = {
    clientId: 99, name: 'Anna Scott', scmlCode: '000200',
    surgeryType: '', insuranceType: '', locationId: 1,
    locationName: 'Riverside', notes: '', clientDate: '2026-03-15T00:00:00Z', payments: []
  };

  beforeEach(() => {
    cy.intercept('GET', '**/api/location', { fixture: 'locations.json' }).as('getLocations');
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' }).as('getRiverside');
    cy.visit('/locations/riverside');
    cy.wait('@getRiverside');
    cy.waitForTable();
    // Close any modal left open by a previous test
    cy.get('body').then($body => {
      if ($body.find('.modal-backdrop').length > 0) {
        cy.get('.modal-box').contains('button', 'Cancel').click({ force: true });
      }
    });
  });

  it('should show the "+ Add Payment" button', () => {
    cy.contains('button', '+ Add Payment').should('be.visible');
  });

  it('should add a blank editable row at the top when clicking Add Payment', () => {
    cy.clickAddPayment();
    cy.get('.styled-table tbody tr').first().find('input').should('exist');
    cy.get('.styled-table tbody tr').first().contains('button', 'Save').should('exist');
    cy.get('.styled-table tbody tr').first().contains('button', 'Cancel').should('exist');
  });

  it('should not allow adding a second row while one is being edited', () => {
    cy.clickAddPayment();
    cy.contains('button', '+ Add Payment').click();
    cy.get('button').filter(':contains("Save")').should('have.length', 1);
  });

  it('should show validation error when SCML code is not valid', () => {
    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('John Smith');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-03-01');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('1234345');
    cy.saveRow();
    cy.get('.message').should('contain', '⚠️');
    cy.get('.message').should('contain', '6 digits');
  });

  it('should show error when amount is missing for Paid status', () => {
    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('John Smith');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-03-01');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('000999');
    cy.get('.styled-table tbody tr:first-child td').eq(5).find('select').select('Paid');
    cy.saveRow();
    cy.get('.message').should('contain', '⚠️');
    cy.get('.message').should('contain', 'Amount and Date');
  });

  it('should create a new Pending client successfully', () => {
    cy.intercept('POST', '**/api/client', { statusCode: 201, body: createdClientResponse }).as('createClient');
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.clickAddPayment();
    cy.get('.styled-table tbody tr:first-child td').eq(0).find('input').type('Anna Scott');
    cy.get('.styled-table tbody tr:first-child td').eq(1).find('input[type="date"]').type('2026-03-15');
    cy.get('.styled-table tbody tr:first-child td').eq(2).find('input').type('000200');

    cy.saveRow();
    cy.wait('@createClient').its('request.body.name').should('eq', 'Anna Scott');
    cy.get('.message').should('contain', '✅');
  });

  it('should restore original rows when cancelling a new row', () => {
    cy.get('.styled-table tbody tr').then(($rows) => {
      const originalCount = $rows.length;
      cy.clickAddPayment();
      cy.get('.styled-table tbody tr').should('have.length', originalCount + 1);
      cy.cancelRow();
      cy.get('.styled-table tbody tr').should('have.length', originalCount);
    });
  });

  it('should enter edit mode when clicking Edit on a row', () => {
    cy.editRow(0);
    cy.get('.styled-table tbody tr').first().find('input').should('exist');
    cy.get('.styled-table tbody tr').first().contains('button', 'Save').should('exist');
  });

  it('should show Edit and Delete buttons in view mode', () => {
    cy.get('.styled-table tbody tr').first().find('.action-btn.edit').should('be.visible');
    cy.get('.styled-table tbody tr').first().find('.action-btn.delete').should('be.visible');
  });

  it('should update a client when saving edit', () => {
    // Mock BOTH the PUT client AND any payment PUT that might be triggered
    cy.intercept('PUT', '**/api/client/**', { statusCode: 204, body: null }).as('updateClient');
    cy.intercept('PUT', '**/api/payment/**', { statusCode: 204, body: null }).as('updatePayment');
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.editRow(0);
    // Edit the notes field (col 9)
    cy.get('.styled-table tbody tr:first-child td').eq(9).find('input').clear().type('Updated note');

    cy.contains('button', 'Save').click();
    cy.wait('@updateClient');
    // After save, success message or no error
    cy.get('.modal-backdrop').should('not.exist');
    cy.get('.message').should('contain', '✅');
  });

  it('should open the delete options modal when clicking Delete on a client', () => {
    cy.deleteRow(0);
    cy.get('.modal-backdrop').should('be.visible');
    cy.get('.modal-box h3').should('contain', 'Delete Options');
  });

  it('should show both delete options in the modal', () => {
    cy.deleteRow(0);
    cy.get('.modal-box').should('contain', 'Remove only this line');
    cy.get('.modal-box').should('contain', 'Delete Client & History');
  });

  it('should close the modal when clicking Cancel', () => {
    cy.deleteRow(0);
    cy.get('.modal-box').contains('button', 'Cancel').click();
    cy.get('.modal-backdrop').should('not.exist');
  });

  it('should show confirmation modal when choosing Delete Client & History', () => {
    cy.deleteRow(0);
    cy.get('.modal-box').contains('Delete Client & History').click();
    cy.get('.modal-box h3').should('contain', 'Confirm Deletion');
    cy.get('.modal-box').should('contain', 'CRITICAL WARNING');
  });

  it('should delete a client after final confirmation', () => {
    cy.intercept('DELETE', '**/api/client/**', { statusCode: 204, body: null }).as('deleteClient');
    cy.intercept('GET', '**/api/client/location/riverside', { fixture: 'riverside-clients.json' });

    cy.deleteRow(0);
    cy.get('.modal-box').contains('Delete Client & History').click();
    cy.get('.modal-box').contains('button', 'Yes, delete').click();

    cy.wait('@deleteClient');
    cy.get('.message').should('contain', 'deleted');
  });

  it('should show payment-only confirmation when choosing Remove only this line', () => {
    cy.deleteRow(0);
    cy.get('.modal-box').contains('Remove only this line').click();
    cy.get('.modal-box').should('contain', 'Are you sure you want to remove this line?');
  });
});