/* eslint-disable no-console */
const { codeFrameColumns } = require('@babel/code-frame')
const fs = require('fs-extra')
const _ = require('lodash')
const path = require('path')
const { expect } = require('chai')
const bluebird = require('bluebird')
const Debug = require('debug')
const chalk = require('chalk')
const stripAnsi = require('strip-ansi')
const cypress = require('cypress')

const debug = Debug('test')
const rootDir = process.cwd()

// Debug.enable('test')

const cp = require('child_process')

const _spawn = cp.spawn

cp.spawn = function () {
  arguments[2].stdio = 'pipe'
  const ret = _spawn.apply(this, arguments)

  return ret
}

afterEach(function () {
  const err = this.currentTest.err

  if (err) {
    console.log('some error', err)
    mapError(err)
  }
})

beforeEach(function () {
  this.currentTest.timeout(50000)
})

exports.runTest = async (options = {}) => {
  if (!options.spec) {
    throw new Error('options.spec not supplied')
  }

  let parsedExpectedResults = {}

  if (!_.isArray(options.spec)) {
    const fileStr = (await fs.readFile(options.spec)).toString()
    const match = /EXPECT.{0,3}:.{0,3}({[\s\S]*?})/.exec(fileStr)

    if (match) {
      parsedExpectedResults = require('json5').parse(match[1])
    }
  }

  const opts = _.defaults(options, {
    snapshot: false,
    spec: '',
    expectedResults: {},
    expectedStdout: null,
  })

  _.extend(opts, _.pick(parsedExpectedResults, _.keys(opts)))

  parsedExpectedResults = _.omit(parsedExpectedResults, _.keys(opts))

  const expectedResults = _.defaults({}, parsedExpectedResults, opts.expectedResults, {
    totalFailed: 0,
  })

  console.log(chalk.cyanBright(`starting test run: ${opts.spec}`))

  const stdio = captureStdio(process.stdout)

  stdio.passThrough((v) => chalk.magenta(stripAnsi(v.toString())))
  // const stdio2 = captureStdio(process.stdout)

  let stdout

  return cypress.run({
    spec: opts.spec,
  }).then((res) => {
    expect(res).includes(expectedResults)
  })
  .finally(() => {
    // console.log(chalk.magenta(stdio.toString()))
    stdout = stdio.toString()
    stdio.restore()
  })
  .then(() => {
    if (opts.expectedStdout) {
      _.forEach(opts.expectedStdout, (v) => {
        expect(stdout).include(v)
        console.log(`${chalk.bold('run matched stdout:')}\n${v}`)
      })
    }

    // console.log(stdout)
    console.log(`${chalk.bold('run matched these results:')} ${JSON.stringify(expectedResults, null, 2)}`)
  })
}

const mapError = async (e) => {

  const slicedStack = e.stack.split('\n') //.slice(1)

  debug({ slicedStack })
  const lastSrcStack = _.findIndex(
    slicedStack,
    (v) => !v.includes('node_modules') && v.split(path.sep).length > 2,
  )

  debug({ lastSrcStack })

  const entryNodeModuleStack = null //slicedStack[lastSrcStack - 1]

  debug({ entryNodeModuleStack })

  const entryNodeModuleRE = /node_modules\/(.*?)\//.exec(
    entryNodeModuleStack,
  )
  let entryNodeModule

  if (entryNodeModuleRE) {
    entryNodeModule = entryNodeModuleRE[1]
  }

  // debug({ entryNodeModule })
  let codeFrame

  debug({ stack: e.stack.split('\n'), rootDir })
  const srcStackArr = await bluebird
  .resolve(
    e.stack
    .split('\n')
    .filter(
      (v, i) => {
        return i === 0 ||
              (!v.includes('/node_modules/')) // && v.includes(rootDir))
      },
    ),
  )
  .mapSeries(async (v) => {
    // const match = /^(\W+)(at.*?)(\/.+?)(:)(\d+)(:)(\d+)(\)?)/.exec(v)
    const match = /^(\W+)(at[^(]*)\(?(.+?)(:)(\d+)(:)(\d+)(\)?)/.exec(v)

    debug({ mapStack: v, match })
    if (match) {
      const relativePath = match[3] //path.relative(rootDir, match[3])

      // return `at ./${relativePath}:${match[2]}:${match[3]}`
      match[3] = relativePath
      if (!codeFrame) {
        codeFrame = await getCodeFrame(match)
      }

      match[3] = chalk.rgb(72, 160, 191)(relativePath)

      return match.slice(1).join('')
    }

    return v
  })

  const srcStack = srcStackArr.join('\n')
  const srcStackShort = srcStackArr.slice(1, 2).join('\n')

  debug(srcStack)

  // const info = /at (.+?):(\d+):(\d+)/.exec(srcStack)
  // .split('\n')

  // .slice(5, 10)
  // .join('\n')

  // debug({ file: rawlines.toString() })

  console.log(chalk.dim(srcStack))
  console.log(codeFrame)
  // debug({ entry, args })

  console.log(`
    ☠️  ${
  entryNodeModule ? ` [${chalk.bold(entryNodeModule)}] ` : ''
}${chalk.red(e.message)}
      ${srcStackShort}
  `)
}

const getCodeFrame = async (info) => {
  if (await fs.pathExists(info[3])) {
    const location = { start: { line: +info[5], column: +info[7] } }
    const rawlines = (await fs.readFile(info[3])).toString()
    // .split('\n')
    // .slice(location.start.line - 2, location.start.line + 2)
    // .join('\n')
    // debug({ path: info[1], location })
    const result = codeFrameColumns(rawlines, location, {
      highlightCode: true,
      linesAbove: 2,
      linesBelow: 3,
    })

    return `\n${result}`
  }
}

const captureStdio = (stdio, tty) => {
  let logs = []
  let passThrough = null

  const write = stdio.write
  const isTTY = stdio.isTTY

  stdio.write = function (str) {
    logs.push(str)
    if (passThrough) {
      return write.apply(this, [passThrough(str)])
    }
  }

  if (tty !== undefined) stdio.isTTY = tty

  return {

    passThrough (fn) {
      passThrough = fn
    },

    data: logs,

    reset: () => (logs = []),

    toString: () => {
      return stripAnsi(logs.join(''))
    },

    toStringRaw: () => {
      return logs.join('')
    },

    restore () {
      stdio.write = write
      stdio.isTTY = isTTY
    },
  }
}

exports.captureStdio = captureStdio
