const { runTest } = require('../helpers')
const path = require('path')

describe('can test', () => {
  it('can fail with async hooks', async () => {
    await runTest({
      spec: path.resolve(__dirname, '../../cypress/tests/e2e/after-hook-fail.spec.js'),
      statusCode: 1,
    })
  })
})
