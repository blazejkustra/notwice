---
kind: forbid
pattern: 'time\.Now\(\)\.Sub\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Use time.Since instead of time.Now().Sub().

## Bad
~~~~
elapsed := time.Now().Sub(start)
~~~~

## Good
~~~~
elapsed := time.Since(start)
~~~~
