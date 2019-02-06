

<div align="center">
    <img src="docs/readme-logo.png">
    <h1>cypress-plugin-retries</h1>

<p>A Cypress plugin to retry failed tests. Uses environment variable <code>CYPRESS_RETRIES</code> to set the number of retries.</p>

</div>



### Quick Start

Add the plugin to `devDependencies`
```bash
npm install -D cypress-plugin-retries
```


At the top of **`cypress/support/index.js`**:
```js
require('cypress-plugin-retries')
```

Use the environment variable `CYPRESS_RETRIES` to set the retry number:
```bash
CYPRESS_RETRIES=3 npm run cypress
```

Feel free to open issues!

### Thanks to
@debrisapron


### License
MIT