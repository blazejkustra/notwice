---
kind: forbid
pattern: '^func\s+\((?:this|self)\s'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (naming)
---
Name receivers after the type, never this or self.

## Bad
~~~~
func (this *Server) Start() {
~~~~

## Good
~~~~
func (s *Server) Start() {
~~~~
