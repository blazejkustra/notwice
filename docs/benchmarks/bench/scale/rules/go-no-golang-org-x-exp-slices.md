---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"golang\.org\/x\/exp\/slices(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import golang.org/x/exp/slices; use the standard slices package.

## Bad
~~~~
import "golang.org/x/exp/slices"
~~~~

## Good
~~~~
"slices"
~~~~
