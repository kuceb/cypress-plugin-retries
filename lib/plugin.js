const chalk = require('chalk')

module.exports = function (on) {
  on('task', {
    logRetry ([title, currentRetry, nestedDepth]) {
      // eslint-disable-next-line no-console
      console.log(`${chalk.yellow(`${'  '.repeat(nestedDepth)}(retry ${currentRetry})`)} ${chalk.dim(title)}`)
    },
  })
}
