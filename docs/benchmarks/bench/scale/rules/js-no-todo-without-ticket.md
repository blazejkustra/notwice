---
kind: forbid
pattern: '\b(?:TODO|FIXME)\b(?!\([A-Z][A-Z0-9]+-\d+\))'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Every TODO or FIXME needs a ticket: TODO(ABC-123).

## Bad
~~~~
// TODO: handle retries
~~~~

## Good
~~~~
// TODO(API-412): handle retries
~~~~
