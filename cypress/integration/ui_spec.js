const {
  adminUrl,
  user: { email, password },
} = Cypress.env();

describe('Strapi Login flow', () => {
  it('visit the Strapi admin panel', () => {
    cy.visit(adminUrl);
    cy.get('form', { timeout: 10000 }).should('be.visible');
  });

  it('Fill the login form', () => {
    cy.get('input[name="email"]').type(email).should('have.value', email);
    cy.get('input[name="password"]').type(password).should('have.value', password);
    cy.get('button[type="submit"]').click();
  });

  it('Change language to english', () => {
    cy.get('div.adminPageRightWrapper').should('be.visible');
    cy.get('button.localeDropdownContent').should('be.visible').click({force: true});
    cy.get('button.localeToggleItem').should('be.visible').contains('English').click();
  });

  it('Enter to the plugin Home Page', () => {
    cy.contains('Email designer', { timeout: 10000 }).click();
    cy.url().should('include', '/plugins/email-designer');
  });

  // @todo add [ CREATE | EDIT | DELETE ] tests
});
