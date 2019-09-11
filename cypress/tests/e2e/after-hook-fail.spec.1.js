/// <reference types="cypress"/>

/* EXPECT: {
  totalFailed: 1,
  totalPassed: 1
} */

describe('should not pass when really failed', () => {

  it('expect pass', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      // throw new Error('foo')
    })
  })

  it('expect fail', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      throw new Error('foo')
    })
  })

  after(() => {
    Cypress.log({ message: 'foo' })
  })

})
