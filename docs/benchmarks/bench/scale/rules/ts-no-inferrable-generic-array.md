---
kind: forbid
pattern: ':\s*Array<(?:string|number|boolean)>'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Write string[] instead of Array<string> for simple types.

## Bad
~~~~
let names: Array<string> = []
~~~~

## Good
~~~~
let names: string[] = []
~~~~
