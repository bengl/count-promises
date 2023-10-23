# count-promises

This library helps you count the promises created from one point in time to
another. The intent is to help you find out where promises may be coming from
in order to optimize your application. Promises can be very expensive,
especially when `async_hooks` are used, so it's good to keep them to a minimum
if you can.

**WARNING**: This works on Node.js only.

## Installation

This is a Node.js package on npm. Install it how you normally would install
such a package.

## Usage

Import it, call it to start counting, call the result to stop counting.

```js
import startCounter from 'count-promises'

// At some point you want to start counting promises created...
const stop = startCounter()

// Now create a bunch of promises, maybe await them. Or not! For extra fun try
// awaiting non-promises and see how many promises that creates! :D

// At this point, we want to know how many promises have been created...
const total = stop()
console.log(total, 'promises have been created since `startCounter()`')
```

You can also pass an options object with the following two options:

* **`locations`**: Instead of returning the total number of created promises,
  return an object whose keys are callsites and whose values are numbers of
  promises created at those callsites. Default false.
* **`continuation`**: Omit from the count any promises created outside the
  async continuation starting at the `startCounter()` call. This is useful to
  eliminate any noise from other current HTTP requests, for example. Default
  false.

## License

The MIT License. See LICENSE.txt
