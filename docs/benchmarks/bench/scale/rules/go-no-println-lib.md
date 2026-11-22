---
kind: forbid
pattern: '\bfmt\.Print(?:ln|f)?\('
targets: [files]
paths: ['internal/**/*.go', 'pkg/**/*.go']
severity: block
from: benchmark distractor (language)
---
No fmt.Print in library packages; use the logger.

## Bad
~~~~
fmt.Println("starting", addr)
~~~~

## Good
~~~~
slog.Info("starting", "addr", addr)
~~~~
