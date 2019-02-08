

<div align="center">
    <img src="docs/readme-logo.png">
    <h1>cypress-plugin-retries <kbd>beta</kbd></h1>
    <a href="https://www.npmjs.com/package/cypress-plugin-retries"><img src="https://img.shields.io/npm/v/cypress-plugin-retries.svg?style=flat"></a>
<p>A Cypress plugin to retry failed tests</p>

</div>

> :warning: this module is in beta, and might cause some strange failures. Please report bugs in the issues of this repo.

> [please refer to this issue for updates about official cypress retry support](https://github.com/cypress-io/cypress/issues/1313)

![](docs/readme-screenshot.png)

### Installation

Add the plugin to `devDependencies`
```bash
npm install -D cypress-plugin-retries
```

At the top of **`cypress/support/index.js`**:
```js
require('cypress-plugin-retries')
```


### Usage

Use the environment variable `CYPRESS_RETRIES` to set the retry number:
```bash
CYPRESS_RETRIES=3 npm run cypress
```

### License
[MIT](LICENSE)
