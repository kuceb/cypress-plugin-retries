describe('Some flaky suite', () => {
  let counter = 0

  beforeEach(() => {
    Cypress.currentTest.retries(4)
  })

  it('should pass on 3rd attempt', () => {
    counter++
    expect(counter === 3, 'some flaky assertion').eq(true)
  })
})
