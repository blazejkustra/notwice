---
kind: forbid
pattern: '\bsatisfies\s+any\b'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
satisfies any checks nothing; name the real type.

## Bad
~~~~
const config = {} satisfies any
~~~~

## Good
~~~~
const config = {} satisfies Config
~~~~
