const { spawn } = require('node:child_process')

function spawnPromise(command, args, options)
{
    let child
    let spawnResolve, spawnReject
    let exitResolve, exitReject

    // Handle `error` event ocurring before `spawn` event
    const onSpawnErrorHandler = (err) => {
        spawnReject(err)
    }

    // Handle `error` event ocurring after `spawn` event
    const onExitErrorHandler = (err) => {
        exitReject(err)
    }

    // Handle `spawn` event
    const onSpawnHandler = () => {

        // Remove spawn error listener and replace with exit error handler
        child.removeListener('error', onSpawnErrorHandler)
        child.once('error', onExitErrorHandler)

        spawnResolve(child)
    }

    // Handle `exit` event
    const onExitHandler = ((code, signal) => {

        // Subprocess exited from a signal
        if (signal != null) {
            return exitReject({
                message: `Child process was signalled with ${signal}`,
                signal,
            })
        }

        // Subprocess exited with non-zero exit code
        if (code != null && code != 0) {
            return exitReject({
                message: `Child process exited with code ${code}`,
                code,
            })
        }

        exitResolve({
            message: `Child process exited`,
        })
    })

    // Create promise that resolves on child exit
    const exitPromise = new Promise((_resolve, _reject) => {
        exitResolve = _resolve
        exitReject = _reject
    })

    // Create and return promise that resolves on successful spawn
    return new Promise((_resolve, _reject) => {
        spawnResolve = _resolve
        spawnReject = _reject

        child = spawn(command, args, options)

        child.once('error', onSpawnErrorHandler)
        child.once('spawn', onSpawnHandler)
        child.once('exit', onExitHandler)

        child.exitPromise = exitPromise
    })
}

module.exports = { spawnPromise }
