---
kind: forbid
pattern: '\?\.\(\)!'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not assert the result of an optional call.

## Bad
~~~~
const value = getter?.()!
~~~~

## Good
~~~~
const value = getter?.() ?? fallback
~~~~
