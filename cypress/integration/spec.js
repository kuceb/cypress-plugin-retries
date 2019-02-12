/// <reference types="cypress"/>

Cypress.config('defaultCommandTimeout', 100)
const retryNum = 4
Cypress.env('RETRIES', retryNum)
Cypress.env('NO_FAIL', false)

describe('deeply nested', () => {
  const pushHook = name => {
    console.log(`%c${name}`, 'color:blue')
    expect(name).ok
    hooks.push(name)
  }
  let hooks = []
  let foo = 0

  const failUntil = num => {
    if (Cypress.env('NO_FAIL')) {
      return
    }
    if (num === true) {
      expect(false).ok
    }
    if (foo <= num) {
      cy.get('failOn' + foo)
    }
  }

  cy.on('fail', err => {
    hooks.push('FAIL')
    // debugger
    throw err
  })

  Cypress.env('RETRIES', 4)
  beforeEach(() => {
    pushHook('BE 0')
    foo++
  })
  describe('1', () => {
    before(() => {
      pushHook('B 1')
    })
    beforeEach(() => {
      pushHook('BE 1')
      failUntil(1)
    })

    describe('2', () => {
      beforeEach(() => {
        pushHook('BE 2')
        failUntil(2)
      })
      beforeEach(() => {
        pushHook('BE 2 B')
      })
      beforeEach(() => {
        pushHook('BE 2 C')
      })
      it('T 2', () => {
        pushHook('T 2')
        failUntil(3)
        expect(hooks).deep.eq([
          'B 1',
          'BE 0',
          'BE 1',
          'BE 0',
          'BE 1',
          'BE 2',
          'BE 0',
          'BE 1',
          'BE 2',
          'BE 2 B',
          'BE 2 C',
          'T 2',
          'AE 2',
          'AE 1',
          'AE 1 B',
          'AE 0',
          'BE 0',
          'BE 1',
          'BE 2',
          'BE 2 B',
          'BE 2 C',
          'T 2'
        ])
        hooks = []
      })

      it('T 2 B', () => {
        pushHook('T 2 B')
        failUntil(4)
      })
      afterEach(function() {
        pushHook('AE 2')
      })
    })
    afterEach(function() {
      pushHook('AE 1')
    })
    afterEach(function() {
      pushHook('AE 1 B')
    })
  })
  afterEach(() => {
    pushHook('AE 0')
  })
  after(() => {
    pushHook('AA 0')
    expect(hooks).deep.eq([
      'AE 2',
      'AE 1',
      'AE 1 B',
      'AE 0',
      'BE 0',
      'BE 1',
      'BE 2',
      'BE 2 B',
      'BE 2 C',
      'T 2 B',
      'AE 2',
      'AE 1',
      'AE 1 B',
      'AE 0',
      'AA 0'
    ])
  })
})

describe('async', () => {
  it('pass using done', function(done) {
    Cypress.env('RETRIES', 4)

    cy.on('fail', err => {
      done()
    })
    expect(false).ok
  })
})

describe('fail 10 times', function() {
  this.retries(10)
  let foo = 0
  beforeEach(() => {
    foo++
    expect(foo).gt(2)
  })
  it('test', function() {
    expect(foo).gt(10)
    expect(this._runnable.currentRetry()).eq(10)
  })
})
