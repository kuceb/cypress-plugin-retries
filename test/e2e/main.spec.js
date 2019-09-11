const { runTest } = require('../helpers')
const path = require('path')
const glob = require('fast-glob')

describe('can test', async () => {

  glob.sync(path.join(__dirname, '../../cypress/tests/e2e/**.*'))
  .map((v) => {
  // .mapSeries((v) => {
    const filename = path.relative(process.cwd(), v)

    it(`test: ${filename}`, async () => {
      await runTest({
        spec: v,
      })
    })
  })
})
