---
kind: forbid
pattern: '(?<![\w.])__(?:dirname|filename)\b'
targets: [files]
paths: ['*.mjs']
severity: block
from: benchmark distractor (naming)
---
__dirname does not exist in ESM; use import.meta.dirname.

## Bad
~~~~
const root = __dirname
~~~~

## Good
~~~~
const root = import.meta.dirname
~~~~
