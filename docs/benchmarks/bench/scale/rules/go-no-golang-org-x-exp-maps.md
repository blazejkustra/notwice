---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"golang\.org\/x\/exp\/maps(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Replace golang.org/x/exp/maps with the standard maps package.

## Bad
~~~~
import "golang.org/x/exp/maps"
~~~~

## Good
~~~~
"maps"
~~~~
