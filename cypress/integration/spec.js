/// <reference types="cypress"/>

window.foo = 0
window.foo2 = 0

describe('page', function() {
  // this.retries(10)

  beforeEach(function(){
    cy.wrap(true).as('outer')
    cy.timeout(200)
    cy.log(window.foo)
    window.foo++
    // expect(false).ok
    if (window.foo > 1 && window.foo <= 3) {
      cy.get('foo')
    }
  })

  describe('inner tests', ()=>{
    beforeEach(()=>{
      cy.timeout(200)
      window.innerFoo = (window.innerFoo || 0) + 1
      if (window.innerFoo < 2) {
        cy.get('bar')
      }
    })
    it('inner before each fail once', ()=>{
      expect(true).ok
    })
  })

  it('pass', ()=>{
    cy.get('bar').should('not.exist')
  })

  it('fail beforeEach twice', ()=>{
    expect(true).ok
  })

  it('fail once', ()=>{
    cy.log('foo2', window.foo2)
    expect(++window.foo2).eq(2)
    window.foo2 = 0
  })

  it('fail twice', ()=>{
    cy.log('foo2', window.foo2)
    expect(++window.foo2).eq(3)
    window.foo2 = 0
  })

  it('fail four times', ()=>{
    cy.log('foo2', window.foo2)
    expect(++window.foo2).eq(5)
  })

  describe('scope', ()=>{
    beforeEach(function () {
      // expect(false).ok
      cy.spy().as('be_foobar')
      // cy.log('adsfasdf')
      // debugger
      // cy.wrap(false).as('outer')
      expect(this.outer).to.eq(true)
    })
    it('can alias', function(){
      cy.spy().as('foobar')
      expect(this.foobar).to.not.be.called
      expect(this.be_foobar).to.not.be.called
  
  
    })
  })


})
