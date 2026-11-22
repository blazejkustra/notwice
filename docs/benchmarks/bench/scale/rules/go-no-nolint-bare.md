---
kind: forbid
pattern: '//\s*nolint\s*$'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
//nolint must name the linter and a reason.

## Bad
~~~~
x := compute() //nolint
~~~~

## Good
~~~~
x := compute() //nolint:gosec // input is a constant
~~~~
