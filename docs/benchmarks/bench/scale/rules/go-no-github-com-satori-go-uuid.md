---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/satori\/go\.uuid(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on github.com/satori/go.uuid; reach for github.com/google/uuid.

## Bad
~~~~
import "github.com/satori/go.uuid"
~~~~

## Good
~~~~
"github.com/google/uuid"
~~~~
