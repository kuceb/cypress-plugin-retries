/// <reference types="cypress"/>

const { _ } = Cypress

const getFailTwice = () => {
  return _.before(3, () => {
    throw new Error('foo')
  })
}

let failTwice = getFailTwice()

describe('suite', () => {
  it('expect pass 1', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      failTwice()
      failTwice = getFailTwice()
    })
  })

  it('expect pass 2', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      failTwice()
      failTwice = getFailTwice()
    })
  })

  it('expect pass 3', () => {
    Cypress.currentTest.retries(2)

    cy.wait(10).should(() => {
      // throw new Error('foo')
      failTwice()
      failTwice = getFailTwice
    })
  })

  after(() => {
  })
})
