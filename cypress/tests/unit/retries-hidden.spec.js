/// <reference types="cypress"/>

const { _ } = Cypress

Cypress.env('RETRIES_HIDDEN', true)

if (!top.alreadyRan) {
  top.alreadyRan = true
  cy.$$('.restart', top.document).click()
}

const failTwice = _.before(3, () => {
  throw new Error('foo')
})

describe('suite', () => {

  it('retries are hidden when RETRIES_HIDDEN', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      failTwice()
      cy.wrap(cy.$$('.retry-0', top.document)).should('not.be.visible')
    })

  })
})
