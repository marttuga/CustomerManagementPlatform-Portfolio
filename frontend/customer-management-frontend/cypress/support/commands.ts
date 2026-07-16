declare global {
  namespace Cypress {
    interface Chainable {
      goToLocation(key: string): Chainable<void>;
      clickAddPayment(): Chainable<void>;
      fillField(field: string, value: string): Chainable<void>;
      selectDropdownOption(field: string, option: string): Chainable<void>;
      markAsPaid(amount: string, date: string): Chainable<void>;
      saveRow(): Chainable<void>;
      cancelRow(): Chainable<void>;
      editRow(index: number): Chainable<void>;
      deleteRow(index: number): Chainable<void>;
      waitForTable(): Chainable<void>;
      searchTable(term: string): Chainable<void>;
      clearSearch(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('goToLocation', (key: string) => {
  cy.visit(`/locations/${key}`);
  cy.waitForTable();
});

Cypress.Commands.add('clickAddPayment', () => {
  cy.contains('button', '+ Add Payment').click();
  cy.get('.styled-table tbody tr').first().should('exist');
});

Cypress.Commands.add('fillField', (field: string, value: string) => {
  cy.get(`.styled-table tbody tr:first-child`)
    .find(`input`)
    .first()
    .clear()
    .type(value);
});

Cypress.Commands.add('selectDropdownOption', (field: string, option: string) => {
  cy.get('.multi-select-trigger').first().click();
  cy.contains('.dropdown-item span', option).click();
});

Cypress.Commands.add('markAsPaid', (amount: string, date: string) => {
  cy.get('select').filter(':visible').first().select('Paid');
  cy.get('input[type="text"]').filter(':visible').last().clear().type(amount);
  cy.get('input[type="date"]').filter(':visible').last().clear().type(date);
});

Cypress.Commands.add('saveRow', () => {
  cy.contains('button', 'Save').click();
  cy.get('.spinner', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('cancelRow', () => {
  cy.contains('button', 'Cancel').click();
});

Cypress.Commands.add('editRow', (index: number) => {
  cy.get('.styled-table tbody tr').eq(index).contains('button', 'Edit').click();
});

Cypress.Commands.add('deleteRow', (index: number) => {
  cy.get('.styled-table tbody tr').eq(index).contains('button', 'Delete').click();
});

Cypress.Commands.add('waitForTable', () => {
  cy.get('.styled-table', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('searchTable', (term: string) => {
  cy.get('input[placeholder*="Search"]').clear().type(term);
  cy.wait(300);
});

Cypress.Commands.add('clearSearch', () => {
  cy.get('input[placeholder*="Search"]').clear();
  cy.wait(300);
});

export {};