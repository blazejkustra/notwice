import { logAgent } from '../../src/core/store.mjs'

const [worker, count] = process.argv.slice(2)
for (let i = 0; i < Number(count); i++) logAgent({ e: 'task', s: `worker-${worker}`, text: `line ${i} ${'x'.repeat(200)}` })
