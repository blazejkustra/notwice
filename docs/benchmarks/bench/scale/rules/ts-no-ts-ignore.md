---
kind: forbid
pattern: '@ts-ignore'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use @ts-expect-error with a reason instead of @ts-ignore.

## Bad
~~~~
// @ts-ignore
~~~~

## Good
~~~~
// @ts-expect-error: upstream types miss the overload
~~~~
