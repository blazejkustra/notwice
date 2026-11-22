---
kind: forbid
pattern: '^func\s+init\(\)'
targets: [files]
paths: ['internal/**/*.go', 'pkg/**/*.go']
severity: block
from: benchmark distractor (language)
---
No init() functions in library packages.

## Bad
~~~~
func init() {
~~~~

## Good
~~~~
func NewRegistry() *Registry {
~~~~
