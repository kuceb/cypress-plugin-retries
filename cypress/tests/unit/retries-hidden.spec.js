/// <reference types="cypress"/>

const { _ } = Cypress

if (!top.alreadyRan) {
  Cypress.env('RETRIES_HIDDEN', true)
  top.alreadyRan = true
  cy.$$('.restart', top.document).click()
}

expect(Cypress.env('RETRIES_HIDDEN')).ok

const failTwice = _.before(3, () => {
  throw new Error('foo')
})

describe('suite', () => {

  it('retries are hidden when RETRIES_HIDDEN', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      failTwice()
      cy.wrap(cy.$$('.command.retry-0', top.document)).should('not.be.visible')
    })

  })
})
