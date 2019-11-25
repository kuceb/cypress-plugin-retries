let logs = []

const { $ } = Cypress

const getDefaultRetries = () => {
  return Cypress.env('RETRIES')
}

const getRetriesHidden = () => {
  return Cypress.env('RETRIES_HIDDEN')
}

const debug = function () {
  // console.log.apply(this, arguments)
}

function getTestNestedDepth (test) {
  let count = 0
  let parent = test.parent

  while (parent && count < 10) {
    count++
    parent = parent.parent
  }

  return count
}

const _top = top

const _clone = Cypress.mocha._mocha.Mocha.Test.prototype.clone

Cypress.mocha._mocha.Mocha.Test.prototype.clone = function () {
  if (this.trueFn) {
    this.fn = this.trueFn
  }

  const ret = _clone.apply(this, arguments)

  ret.id = this.id
  ret.err = null
  debug('clone test')
  logs.forEach((log) => {
    log.set({
      state: `${log.get().state} ignored retry-${ret._currentRetry}`,
    })
  })

  if (!Cypress.env('RETRIES_NO_LOG') && Cypress.config('isTextTerminal') && cy.state('runnable')) {
    const nestedDepth = getTestNestedDepth(this)

    cy.now('task', 'logRetry', [this.title, `${ret._currentRetry + 1}/${ret._retries}`, nestedDepth], { log: false })
    .catch((e) => {})
  }

  setTimeout(() => {

    const a = $('.runnable-active', _top.document).find('.runnable-state')

    if (!$(`.runnable-active .retry-icon.retry-${ret._currentRetry}`, _top.document).length) {

      const b = $(`<i class="retry-icon retry retry-${ret._currentRetry} fa fa-x" />`, _top.document)

      b.prependTo(a.parent())
    }
  }, 0)

  logs = []

  return ret
}

Cypress.on('log:added', (attr, log) => {
  logs.push(log)
})

const _onRunnableRun = Cypress.runner.onRunnableRun

Cypress.runner.onRunnableRun = function (runnableRun, runnable, args) {
  debug('_onRunnableRun')

  const r = runnable
  const isHook = r.type === 'hook'
  const isAfterAllHook = isHook && r.hookName.match(/after all/)
  const isBeforeHook = isHook && r.hookName.match(/before each/)
  const test = r.ctx.currentTest || r

  if (test._currentRetry === 0 && logs.testId !== test.id) {
    logs = []
    logs.testId = test.id
  }

  const next = args[0]

  debug('on:', r.title)

  if (
    isHook &&
    r.ctx.currentTest &&
    r.ctx.currentTest.trueFn &&
    !isAfterAllHook
  ) {
    debug('already failed, skipping this hook')

    return next.call(this)
  }

  debug('running')

  const onNext = function (err) {
    debug(runnable.title, 'onNext')

    const fail = function () {
      return next.call(this, err)
    }
    const noFail = function () {
      test.err = null

      return next.call(this)
    }

    if (err) {
      if (test._retries === -1) {
        test._retries = getDefaultRetries()
      }

      if (isBeforeHook && test._currentRetry < test._retries) {
        test.trueFn = test.fn
        test.fn = function () {
          throw err
        }

        return noFail()
      }
    }

    return fail()
  }

  args[0] = onNext

  return _onRunnableRun.apply(this, [runnableRun, runnable, args])
}

// const pluginError = (message) => {
//   throw new Error(`[cypress-plugin-retries]: ${message}`)
// }

addGlobalStyle(/*css*/ `
.command-state-retry {
  color: orange
}
.command-state-retry .command-number {
  /* display:none */
}
.command-state-retry .command-method span{
  background-color: #FCB827;
  color: white;
  border-radius: 2px;
  padding: 0 3px;
  font-size: 11px;
  display: inline-block;
  height: 14px;
  line-height: 16px;
}

.command.ignored {
  opacity: 0.3;
  ${getRetriesHidden() ? 'display: none' : ''}
}
.command.ignored:hover  {
  opacity: 1
}
.command.ignored span .command-wrapper {
  border-left: 4px solid orange
}
.command.ignored .command-number span{
  display: none;
}

.command.ignored .command-number:before, .retry-icon:before {
  font: normal normal normal 12px/1 FontAwesome;
  content: " ";
  color: orange;
}

.runnable-failed .retry-icon {
  display:none
}

.retry-icon {
    display: inline-block;
    line-height: 18px;
    margin-right: 3px;
    /* min-width: 6px; */
    height: 18px;
    text-align: center;
}
/* .command.ignored.retry-0 .command-number:before {
  content: "";
}
.command.ignored.retry-1 .command-number:before {
  content: "2";
}
.command.ignored.retry-2 .command-number:before {
  content: "3";
} */

/* .command.ignored.retry-1 {
  opacity: 0.2
}
.command.ignored.retry-2 {
  opacity: 0.3
} */

.runnable-passed .test-error {
  display:none
}


`)

function addGlobalStyle (css) {
  let head; let style

  $('#__plugin_retries_style__', _top.document).remove()

  head = window.top.document.getElementsByTagName('head')[0]
  if (!head) {
    return
  }

  style = window.top.document.createElement('style')
  style.id = '__plugin_retries_style__'
  style.type = 'text/css'
  style.innerHTML = css
  head.appendChild(style)
}

Object.defineProperty(Cypress, 'currentTest', {
  configurable: true,
  get () {
    const r = cy.state('runnable')

    if (!r) {
      const err = new Error()

      err.message = 'Cypress.currentTest cannot be accessed outside a test or hook (it, before, after, beforeEach, afterEach)'
      throw err
    }

    return r && r.ctx.currentTest || r
  },
})
