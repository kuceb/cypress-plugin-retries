let _current
let _chainerId

const debug = function () {
  console.log.apply(this, arguments)
  // console.log(Cypress._.cloneDeep(window.state.hooks.slice(-1)[0]))
}

const getDefaultRetries = () => {
  return Cypress.env('RETRIES')
}

const _clone = Cypress.mocha._mocha.Mocha.Test.prototype.clone
Cypress.mocha._mocha.Mocha.Test.prototype.clone = function() {
  const ret = _clone.apply(this, arguments)
  if (this.trueFn) {
    ret.fn = this.trueFn
    // this.trueFn = null
  }
  ret.id = this.id
  debug('clone test')

  return ret
}

const _onRunnableRun = Cypress.runner.onRunnableRun
Cypress.runner.onRunnableRun = function(runnableRun, runnable, args) {
  debug('_onRunnableRun')

  const r = runnable
  const isHook = r.type === 'hook'
  const isAfterHook = isHook && r.hookName.match(/after/)
  const isAfterAllHook = isHook && r.hookName.match(/after all/)
  const isBeforeHook = isHook && r.hookName.match(/before/)
  const test = r.ctx.currentTest || r

  const logRetry = () => {
    let shouldLog = true
    test.ctx.hooksLogged = test.ctx.hooksLogged || {}

    if (isHook) {
      shouldLog = !test.ctx.hooksLogged[r.hookName]
      test.ctx.hooksLogged[r.hookName] = true
    }

    let retryNum = test._currentRetry+1

    if (shouldLog) {
      // wrap this in a 'try' because a bug in cypress will throw if
      // you call Cypres.log before any commands in a test
      try{
        Cypress.log({
          name: `Retry ${retryNum}`,
          type: 'parent',
          message: '',
          state: 'retry'
        })
      } catch(e){
        console.log('ERROR')
      }
  }
  }

  if (test._currentRetry > -1) {
    logRetry()
  }


  const next = args[0]




  debug('on:', r.title)

  if (r.ctx.currentTest && r.ctx.currentTest.trueFn && !isAfterAllHook) {
    debug('already failed, skipping this hook')
    return next.call(this)
  }
  debug('running')



  const onNext = function(err) {

    debug(runnable.title, 'onNext')

    const fail = function() {
      return next.call(this, err)
    }
    const noFail = function () {
      return next.call(this)
    }

    if (err) {
  
      if (test._retries === -1) {
        test._retries = getDefaultRetries()
      }

      if (isBeforeHook && test._currentRetry < test._retries) {
        test.trueFn = test.fn
        console.log('set fn from', test.fn)
        test.fn = function() {
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

addGlobalStyle(/*css*/`
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


`)

function addGlobalStyle(css) {
  var head, style
  head = window.top.document.getElementsByTagName('head')[0]
  if (!head) {
    return
  }
  style = window.top.document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  head.appendChild(style)
}
