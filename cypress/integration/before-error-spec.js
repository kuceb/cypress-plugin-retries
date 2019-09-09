/// <reference types="cypress"/>

describe("Exception in before block", () => {
  describe("Broken case", () => {
    before(() => {
      Cypress.currentTest.retries(1);
      throw new Error("This is the real error!");
    });
  
    it("shouldn't run this test", () => {
      cy.get("#someSelector").should("be.visible");
    });
  });

  describe("Working case", () => {
    before(() => {
      Cypress.currentTest.retries(0);
      throw new Error("This is the real error!");
    });
  
    it("shouldn't run this test", () => {
      cy.get("#someSelector").should("be.visible");
    });
  });
});
