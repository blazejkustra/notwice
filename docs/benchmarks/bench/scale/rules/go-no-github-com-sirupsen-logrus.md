---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/sirupsen\/logrus(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/sirupsen/logrus; use log/slog.

## Bad
~~~~
import "github.com/sirupsen/logrus"
~~~~

## Good
~~~~
"log/slog"
~~~~
