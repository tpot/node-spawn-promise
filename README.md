# spawn-promise

Another Promise-based interface to the `spawn()` function from the
`node:process` built-in module. It turns out there are a lot of these already,
but I wasn't happy with any of them.

## Usage

Spawn `/bin/ls` and display stdout and stderr:

```javascript
const { spawnPromise } = require('@tpot/spawn-promise')

// Spawn executable
const child = await spawnPromise("/bin/ls", [ "-l", "/tmp" ])

// Log stdout and stderr
child.stdout.on('data', (chunk) => console.log(chunk))
child.stderr.on('data', (chunk) => console.error(chunk))

// Await exit of child process
await child.exitPromise
```

If the child cannot be spawned, the promise returned by the `spawnPromise()`
function is rejected with the error. If the child exits with a non-zero exit
code or is killed by a signal, the `exitPromise` property is rejected with an
Object containing a message and the code or signal.

```javascript
// Ignore child exiting with SIGINT
try {
    await child.exitPromise
} catch (err) {
    if (err.signal && err.signal === 'SIGINT') {
        return
    }
    throw err
}
```

## Rationale

There's great documentation for how the `spawn()` function works, but it's
inconvenient have to remember how it works when you come to execute and interact
with a child process over stdio.

My contribution to the already crowded space of npm modules named
`spawn-promise` or `promise-spawn` is distinguishing between error conditions,
and not messing with the output of the spawned executable.

### Error handling

This module separates the following error conditions so they can be handled
separately:

* An error is returned by the `spawn()` command, perhaps because the path does
  not exist, or there is some issue with the executable. We would like to catch
  this condition and abort what we are doing as this is likely a configuration
  or installation issue somewhere.

* An error is indicated by the executable exiting with a non-zero status code,
  or being killed with a signal. You can make an argument that some status codes
  or signals are expected behaviour, and these can be filtered using a try/catch
  block.

The interface as provided by the `node:child_process` module makes detecting
these two conditions more complicated than it needs to be.

### Output

This module keeps the default stdio stream properties on the child process
unchanged.

I like the default interface for `spawn()` which provides pipes (really Node.js
streams) as properties on the child process for all elements of stdio. For a
short-running executable it's reasonable to gather the output into a string for
parsing, but other cases such as breaking the output into lines, or pipelining
into a transform stream (for example gzip) are useful too.

## Resources

* [promise-spawn modules](https://www.npmjs.com/search?q=promise-spawn) on NPM
* [spawn-promise modules](https://www.npmjs.com/search?q=spawn-promise) on NPM
* Source for [node/lib/child_process.js](https://github.com/nodejs/node/blob/ff659faeb8858a9fba70027ccfb1a0251fd64e1f/lib/child_process.js)
