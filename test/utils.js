//
// Test utilities
//

const { spawnPromise } = require('../index.js')

// Return the ext promise for a Node.js script given by a string
async function spawn_node(s)
{
    const child = await spawnPromise('node', [ '-e', s ])
    return child.exitPromise
}

// Exports
module.exports = { spawn_node }
