---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/golang\/mock(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
github.com/golang/mock is banned in this codebase. Use go.uber.org/mock instead.

## Bad
~~~~
import "github.com/golang/mock"
~~~~

## Good
~~~~
"go.uber.org/mock/gomock"
~~~~
