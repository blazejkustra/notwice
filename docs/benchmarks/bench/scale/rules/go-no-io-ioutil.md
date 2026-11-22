---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"io\/ioutil(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
io/ioutil is banned in this codebase. Use io and os instead.

## Bad
~~~~
import "io/ioutil"
~~~~

## Good
~~~~
"os"
~~~~
