const { promiseHooks } = require('v8')
const { AsyncLocalStorage } = require('async_hooks')

let storage

function getLocation () {
  const stack = new Error().stack.split('\n')
  let stackIndex = 2
  let line = stack[stackIndex]
  while (line && (line.includes(__filename)
    || line.includes('node:internal/promise_hooks')
    || line?.endsWith('<anonymous>)'))) {
    line = stack[++stackIndex]
  }
  return (line || stack.pop()).substring(7)
}

/**
 *
 * Initiates the counting of created promises. The returned function stops
 * counting and returns the total.
 *
 * If `locations` is true, it will attempt to find the locations of each
 * created promise and return an object whose keys are the callsites as strings
 * and whose values are the number of promises created at that callsite.
 *
 * If `continuation` is true, promises will only be counted if there is an
 * async continuation chain (as determined by AsyncLocalStorage) back to the
 * given `startCounter()` call. This is helpful for filtering out unrelated
 * promises, like ones from an unrelated concurrent HTTP request.
 *
 * @param {{ locations: boolean, continuation: boolean }} opts
 * @return {() => number | { [string]: number } }
 */
module.exports = function startCounter (opts = { locations: false, continuation: false }) {
  let init
  let result
  if (opts.locations) {
    result = {}
    init = () => {
      const line = getLocation()
      result[line] = 1 + (result[line] || 0)
    }
  } else {
    result = 0
    init = () => result++
  }
  if (opts.continuation) {
    storage ||= new AsyncLocalStorage()
    const store = {}
    storage.enterWith(store)
    const innerInit = init
    init = () => {
      if (storage.getStore() !== store) return
      innerInit()
    }
  }
  const hook = promiseHooks.createHook({ init })
  return () => hook() || result
}
