/// <reference types="cypress"/>

const { _ } = Cypress

const failTwice = _.before(3, () => {
  throw new Error('foo')
})

describe('suite', () => {
  it('expect pass', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      failTwice()
    })
  })

  after(() => {})

})
