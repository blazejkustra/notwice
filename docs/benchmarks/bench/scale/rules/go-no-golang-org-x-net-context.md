---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"golang\.org\/x\/net\/context(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import golang.org/x/net/context; use context.

## Bad
~~~~
import "golang.org/x/net/context"
~~~~

## Good
~~~~
"context"
~~~~
