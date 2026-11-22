---
kind: forbid
pattern: '\bfn\s+[a-z]+[A-Z]\w*\s*[<(]'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (naming)
---
Rust functions are snake_case.

## Bad
~~~~
fn parseHeader(input: &str) {
~~~~

## Good
~~~~
fn parse_header(input: &str) {
~~~~
