const cypress = require('cypress')

cypress.run({
  spec: 'cypress/integration/spec.js',
}).then(res => {
})