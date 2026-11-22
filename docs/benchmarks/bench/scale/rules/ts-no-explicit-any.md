---
kind: forbid
pattern: '(?::\s*any\b|<any>|\bas\s+any\b)'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No explicit any in TypeScript. Use unknown and narrow, or a real type.

## Bad
~~~~
function parse(input: any) {
~~~~

## Good
~~~~
function parse(input: unknown) {
~~~~
