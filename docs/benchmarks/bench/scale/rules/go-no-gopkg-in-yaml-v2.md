---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"gopkg\.in\/yaml\.v2(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
gopkg.in/yaml.v2 is banned in this codebase. Use gopkg.in/yaml.v3 instead.

## Bad
~~~~
import "gopkg.in/yaml.v2"
~~~~

## Good
~~~~
"gopkg.in/yaml.v3"
~~~~
