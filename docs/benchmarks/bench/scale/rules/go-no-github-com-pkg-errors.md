---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/pkg\/errors(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/pkg/errors; use errors and fmt.Errorf with %w.

## Bad
~~~~
import "github.com/pkg/errors"
~~~~

## Good
~~~~
"errors"
~~~~
