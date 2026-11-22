---
kind: forbid
pattern: 'context\.TODO\(\)'
targets: [files]
paths: ['internal/**/*.go', 'pkg/**/*.go']
severity: block
from: benchmark distractor (language)
---
Do not leave context.TODO() in library code; accept a ctx parameter.

## Bad
~~~~
ctx := context.TODO()
~~~~

## Good
~~~~
func Load(ctx context.Context) error {
~~~~
