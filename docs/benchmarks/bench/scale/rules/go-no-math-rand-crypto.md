---
kind: forbid
pattern: '"math/rand"'
targets: [files]
paths: ['**/auth/**/*.go', '**/token*.go', '**/crypto/**/*.go']
severity: block
from: benchmark distractor (language)
---
Use crypto/rand for tokens and keys.

## Bad
~~~~
import "math/rand"
~~~~

## Good
~~~~
import "crypto/rand"
~~~~
