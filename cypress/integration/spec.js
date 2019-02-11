/// <reference types="cypress"/>

Cypress.config('defaultCommandTimeout', 100)
const retryNum = 5
Cypress.env('RETRIES', retryNum)



it('can log', ()=>{
  cy.log('fooo').then(()=>{
    Cypress.log({
      name: 'FOOO'
    })

  })
})


describe.only('0', () => {
  const pushHook = name => {
    console.log(`%c${name}`, 'color:blue')
    expect(name).ok
    hooks.push(name)
  }
  const hooks = []
  let foo = 0
  Cypress.on('fail', (err)=>{
    hooks.push('FAIL')
    // debugger
    throw err
  })

  beforeEach(() => {
    pushHook('BE 0')
  })
  describe('1', () => {
    beforeEach(() => {
      pushHook('BE 1')
      expect(++foo).gt(1)
    })

    describe('2', () => {
      beforeEach(() => {
        pushHook('BE 2')
        expect(foo).gt(2)
      })
      beforeEach(() => {
        pushHook('BE 2 B')
        // expect(false).ok
      })
      beforeEach(() => {
        pushHook('BE 2 C')
        // expect(false).ok
      })
      it('test', () => {
        pushHook('T 2')
        expect('test body').ok
        expect(foo).gt(3)
      })
      afterEach(function() {
        // debugger
        // expect(foo).gt(4)
        pushHook('AE 2')
      })
    })
    afterEach(function() {
      pushHook('AE 1')
      // expect(false).ok
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
    console.log('after', hooks)
    const arr = [
      'BE 1',
      'BE 2',
      'BE 2 B',
      'T 2',
      'AE 2',
      'AE 1',
      'AE 1 B',
      'AE 0'
    ]
    expect(hooks).eq([
      "BE 0",
      "BE 1",
      "BE 0",
      "BE 1",
      "BE 2",
      "BE 0",
      "BE 1",
      "BE 2",
      "BE 2 B",
      "BE 2 C",
      "T 2",
      "AE 2",
      "AE 1",
      "AE 1 B",
      "AE 0",
      "BE 0",
      "BE 1",
      "BE 2",
      "BE 2 B",
      "BE 2 C",
      "T 2",
      "AE 2",
      "AE 1",
      "AE 1 B",
      "AE 0",
      "AA 0"
    ])
    expect(hooks).deep.eq(repeat(arr, 3))
    // expect('afterAll').not.ok
  })
})



describe('retry test', function() {
  Cypress.env('RETRIES', 4)
  // this.retries(3)
  let foo = 0
  beforeEach(() => {
    foo++
    expect(foo).gt(2)
  })
  it('will fail 3 times', function() {
    expect(foo).gt(4)
  })
  it('will pass', () => {
    expect(foo).gt(4)
  })
})

const repeat = (arr, i) => Array(i).fill(arr).reduce((a,b)=>a.concat(b))
