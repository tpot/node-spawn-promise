const assert = require('assert/strict')
const utils = require('./utils.js')

describe('Signal tests', function() {

    it('Rejects when child exits with SIGINT', async function() {
        const signal = 'SIGINT'
        await assert.rejects(
            async () => utils.spawn_node(`process.kill(process.pid, '${signal}')`),
            { signal }
        )
    })
})
