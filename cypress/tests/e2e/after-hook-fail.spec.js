/// <reference types="cypress"/>

describe('should not pass when really failed', () => {
  it('expect fail', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      throw new Error('foo')

    })
  })

  after(() => {})

})
