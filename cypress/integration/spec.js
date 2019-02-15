/// <reference types="cypress"/>

Cypress.config('defaultCommandTimeout', 100)
Cypress.env('RETRIES', 0)

const _ = Cypress._

describe('Cypress.currentTest', () => {
  let error
  let curtest
  try{
    curtest = Cypress.currentTest
  } catch(e) {
    error = e
  }
  let lastId

  it('throws error outside spec', function() {
    expect(error).ok.property('message').contains('currentTest')
    expect(this._runnable).eq(Cypress.currentTest)
    curtest = Cypress.currentTest
    expect(lastId).eq(this._runnable.id)
  })

  beforeEach(() => {
    lastId = Cypress.currentTest.id
  })
  // Cypress.log({message:'set'})
  it('gets correct runnable', () => {
    expect(lastId).eq(Cypress.currentTest.id)
  })
})

describe('deeply nested', () => {
  const pushHook = name => {
    // console.log(`%c${name}`, 'color:blue')
    expect(name).ok
    hooks.push(name)
  }
  let hooks = []
  let foo = 0

  const failUntil = num => {
    if (num === true) {
      expect(false).ok
    }
    if (foo <= num) {
      cy.get('failOn' + foo)
    }
  }

  cy.on('fail', err => {
    hooks.push('FAIL')
    throw err
  })

  beforeEach(() => {
    Cypress.currentTest.retries(4)
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

describe('retries set via Cypress.currentTest.retries', () => {
  let logs = []

  beforeEach(() => {
    Cypress.env('RETRIES', 0)
    if (!Cypress.currentTest._currentRetry) {
      logs = []
    }
    cy.on('log:added', (attr, log) => {
      logs.push(attr)
    })
    Cypress.currentTest.retries(1)
  })

  it('can set retries in hooks', () => {
    expect(logs.length).eq(1)
  })

  it('prefers test retries over env var', () => {
    Cypress.currentTest.retries(2)

    expect(logs.length, 'log length').eq(2)
    cy.log('foo')
  })
})

describe('after all hook', () => {
  describe('after hook fails test', () => {
    let didFail = false

    describe('should fail in after hook', () => {
      it('fails but caught', () => {
        expect(true).ok
      })
      after(() => {
        cy.on('fail', err => {
          didFail = true
          // Cypress.log({message: didFail})
          // throw err
        })
        expect(false).ok
      })
    })
    describe('verify prev fail', () => {
      it('did fail', () => {
        expect(didFail).ok
      })
    })
  })
  describe('after hook lets test fail', () => {
    let didFail = false
    let didRunAfterHook = false
    describe('should fail in after hook', () => {
      it('fails but caught', () => {
        cy.on('fail', err => {
          didFail = true
          // Cypress.log({message: didFail})
          // throw err
        })
        expect(false).ok
      })
      after(() => {
        didRunAfterHook = true
        expect(true).ok
      })
    })
    describe('verify prev fail', () => {
      it('did fail', () => {
        expect(didFail).ok
        expect(didRunAfterHook).ok
      })
    })
  })
})
