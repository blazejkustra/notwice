---
kind: forbid
pattern: '^\s*(?:export\s+)?(?:const\s+)?enum\s+\w+'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use union types or as const objects instead of enums.

## Bad
~~~~
export enum Status { Open, Closed }
~~~~

## Good
~~~~
export type Status = "open" | "closed"
~~~~
