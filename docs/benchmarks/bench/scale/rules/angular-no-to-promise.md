---
kind: forbid
pattern: '\.toPromise\(\)'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
toPromise is deprecated; use firstValueFrom or lastValueFrom.

## Bad
~~~~
const user = await user$.toPromise()
~~~~

## Good
~~~~
const user = await firstValueFrom(user$)
~~~~
