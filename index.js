if (Cypress.env('RETRIES')) {
  const MAX_RETRIES = +Cypress.env('RETRIES')

  let failHandler = () => {}

  const removeSkipFail = err => {
    setTimeout(() => {
      const el = [].slice
        .call(
          window.top.document.querySelectorAll('.test.runnable.runnable-passed')
        )
        .slice(-1)[0].nextSibling
      el.remove()
    }, 1)
    throw err
  }

  const normalFail = err => {
    throw err
  }

  let currentRetry = 0
  let shouldSkipTest = false
  let shouldSkipBefore = false

  const _it = window.it
  const _beforeEach = window.beforeEach
  window.beforeEach = function(...args) {
    const beforeEachFn = args[0]
    args[0] = function() {
      if (shouldSkipBefore) return

      failHandler = err => {
        if (currentRetry === MAX_RETRIES) {
          currentRetry = 0
          throw err
        }
        currentRetry++
        shouldSkipTest = true
        markPrevAsRetry()
      }
      beforeEachFn()
    }

    _beforeEach(...args)
  }
  window.it = (testName, testFn) => {
    if (!testFn) {
      _it(testName)
      return
    }
    Array(MAX_RETRIES + 1)
      .fill()
      .map((x, i) => {
        _it(`${testName} ${i ? `(retry ${i})` : ''}`, function() {
          console.log(testName + ':' + i, 'currentRetry:', currentRetry)
          if (i === MAX_RETRIES) {
            shouldSkipBefore = false
          }
          if (shouldSkipTest) {
            shouldSkipTest = false
            failHandler = normalFail
            this.skip()
          }
          if (currentRetry < i) {
            failHandler = removeSkipFail
            this.skip()
          }

          failHandler = err => {
            if (i === MAX_RETRIES) {
              currentRetry = 0
              throw err
            }
            currentRetry++
            markPrevAsRetry()
            this.skip()
          }

          testFn()
          shouldSkipBefore = true
          currentRetry = 0
          console.log('pass:' + testName + ':on:' + i)
        })
      })
  }
  window.it.skip = _it.skip
  window.it.only = _it.only

  Cypress.on('fail', (...args) => failHandler(...args))

  const markPrevAsRetry = () => {
    setTimeout(() => {
      const el = [].slice
        .call(
          window.top.document.querySelectorAll(
            '.runnable.runnable-pending > .runnable-wrapper .runnable-state'
          )
        )
        .slice(-1)[0]
      el.classList.remove('runnable-pending')
      el.classList.add('runnable-retried')
    }, 10)
  }

  addGlobalStyle(`
	.runnable.runnable-pending > .runnable-wrapper .runnable-state.runnable-retried {
		color: orange
	}
	.runnable.runnable-skipped {
		display:none
	}
	.runnable.runnable-pending > .runnable-wrapper .runnable-state.runnable-retried:before {
		content: ""
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
}
