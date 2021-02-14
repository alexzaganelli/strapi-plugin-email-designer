// @todo import strapi object and retrieve admin url
const strapiAdminUrl = 'http://localhost:1337/admin';

// @todo complete UI tests
describe('UI tests', () => {
  // cy.pause()
  it('visits the Strapi admin panel', () => {
    cy.visit(strapiAdminUrl, { timeout: 10000 });
  });

  it('visits the designer page', () => {
    cy.contains('Email designer').click();
    cy.url().should('include', '/plugins/email-designer');
  });
});
