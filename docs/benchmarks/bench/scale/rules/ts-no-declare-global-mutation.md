---
kind: forbid
pattern: '^\s*declare\s+global\s*\{'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not augment globals; export a typed module instead.

## Bad
~~~~
declare global {
~~~~

## Good
~~~~
export interface AppConfig {}
~~~~
