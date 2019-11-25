/// <reference types="cypress"/>

/* EXPECT: {
  totalFailed: 1,
  totalPassed: 0,
  expectedStdout: ['(retry 1/2) expect fail\n    (retry 2/2) expect fail'],
} */

describe('should not pass when really failed', () => {
  it('expect fail', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      throw new Error('foo')

    })
  })

  after(() => {})

})
