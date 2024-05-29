const assert = require('assert/strict')
const utils = require('./utils.js')

describe('Exit code tests', function() {

    it('Resolves when child exits with code == 0', async function() {
        await utils.spawn_node('process.exit(0)')
    })

    it('Rejects when child exits with code != 0', async function() {
        const code = 123
        await assert.rejects(
            async () => utils.spawn_node(`process.exit(${code})`),
            { code }
        )
    })
})
