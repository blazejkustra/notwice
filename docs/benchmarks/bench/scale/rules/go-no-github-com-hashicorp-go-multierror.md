---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/hashicorp\/go-multierror(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/hashicorp/go-multierror; use errors.Join.

## Bad
~~~~
import "github.com/hashicorp/go-multierror"
~~~~

## Good
~~~~
"errors"
~~~~
