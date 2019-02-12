const cypress = require('cypress')

cypress.run({
  reporter: 'junit',
  browser: 'electron',
  config: {
    // baseUrl: 'http://localhost:8080',
    chromeWebSecurity: false,
  },
}).then(res => {
	console.log(res)
})