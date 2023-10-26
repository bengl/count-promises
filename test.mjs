import startCounter from './count-promises.js'

import assert from 'node:assert'
import { setTimeout } from 'node:timers/promises'

await 1 // clears out the Module.run promise

{
  const stop = startCounter()
  await 1
  assert.strictEqual(stop(), 2)
}

{
  const stop = startCounter({ locations: true })
  await 1
  assert.deepEqual(stop(), {
    [`${import.meta.url}:16:3`]: 2
  })
}

{
  const stop = startCounter({})
  await Promise.resolve()
  assert.strictEqual(stop(), 2)
}

{
  const stop = startCounter({ locations: true })
  await Promise.resolve()
  assert.deepEqual(stop(), {
    [`${import.meta.url}:30:17`]: 2
  })
}

{
  const stop = startCounter({})
  await new Promise(resolve => resolve())
  assert.strictEqual(stop(), 2)
}

{
  const stop = startCounter({})
  await new Promise(resolve => resolve())
  assert.strictEqual(stop(), 2)
}

{
  setTimeout(100).then(async () => {
    return Promise.resolve()
  }, 100)
  const stop = startCounter({ continuation: false })
  await setTimeout(200)
  assert.strictEqual(stop(), 6)
}

{
  setTimeout(100).then(async () => {
    return Promise.resolve()
  }, 100)
  const stop = startCounter({ continuation: true })
  await setTimeout(200)
  assert.strictEqual(stop(), 2)
}

{ // regression test for https://github.com/bengl/count-promises/issues/1
  const stop = startCounter({ continuation: true, locations: true })
  await fetch('http://example.com')
  assert.ok(Object.keys(stop()).length > 10)
}

// Hello there! You might be wondering why I didn't use Node.js built-in test
// framework. The reason is that the test framework adds a bunch of promises
// everywhere, polluting these tests.
