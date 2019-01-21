context('Hotspot', () => {
  beforeEach(() => {
    cy.visit('http://localhost:10002');
    cy.contains('Guide').click();
    cy.contains('Hotspot').click();
  });

  it('Should create a hotspot', () => {
    cy.get('.hotspot').should('exist');
  });
});
