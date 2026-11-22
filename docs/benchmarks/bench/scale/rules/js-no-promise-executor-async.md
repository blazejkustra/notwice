---
kind: forbid
pattern: 'new\s+Promise\(\s*async\b'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Promise executors must not be async functions.

## Bad
~~~~
new Promise(async (resolve) => resolve(await load()))
~~~~

## Good
~~~~
load().then(resolve)
~~~~
