context('Modal', () => {
  beforeEach(() => {
    cy.visit('http://localhost:10002');
    cy.contains('Guide').click();
    cy.contains('Modal').click();
  });

  it('Can open and close a modal', () => {
    cy.contains('Open Modal').click();

    cy.get('.modal').contains('This is a modal').should('be.visible');

    cy.get('.modal').contains('This is a modal').closest('.modal').find('button').click();
    cy.get('.modal').contains('This is a modal').should('not.exist');
  });
});
