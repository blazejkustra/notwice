---
kind: forbid
pattern: '^func\s+\([^)]*\)\s+Get[A-Z]\w*\(\)'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (naming)
---
Getters do not start with Get in Go.

## Bad
~~~~
func (u *User) GetName() string {
~~~~

## Good
~~~~
func (u *User) Name() string {
~~~~
