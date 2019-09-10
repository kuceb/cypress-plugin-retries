/// <reference types="cypress"/>

const runner = Cypress.mocha.getRunner()

const getTest = (r) => r && r.ctx.currentTest || r

const throwMetaError = (mes) => {
  const err = new Error(mes)

  err.name = 'MetaError'
  throw err
}

const throwFakeError = (mes) => {
  const err = new Error(mes)

  err.name = 'FakeError'
  throw err
}

Cypress.on('test:before:run', () => {

  runner.once('fail', (r) => {
    const runnable = cy.state('runnable')
    const test = getTest(runnable)

    if (test.err.name === 'Uncaught MetaError') {
      test.err.message = test.err.message.split('\nThis error originated from')[0]

      return
    }

    if (test.err.name === 'FakeError') {

      test.error = null
      test.state = 'passed'

    }

  })

})

describe('Exception in before block', () => {
  describe('Broken case', () => {
    before(() => {
      Cypress.currentTest.retries(1)

      throwFakeError('This is the real error!')
    })

    it('shouldn\'t run this test', () => {
      throwMetaError('should not have ran')
    })
  })

  describe('Working case', () => {
    before(() => {
      Cypress.currentTest.retries(0)
      throwFakeError('This is the real error!')
    })

    it('shouldn\'t run this test', () => {
      throwMetaError('should not have ran')
    })
  })
})
