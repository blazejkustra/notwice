---
kind: forbid
pattern: '^\s*with\s*\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never use with statements.

## Bad
~~~~
with (config) { start(port) }
~~~~

## Good
~~~~
start(config.port)
~~~~
