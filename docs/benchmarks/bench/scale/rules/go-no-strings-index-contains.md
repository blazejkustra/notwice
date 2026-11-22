---
kind: forbid
pattern: 'strings\.Index\([^)]*\)\s*(?:!=|>=?)\s*-?[01]'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Use strings.Contains instead of checking strings.Index.

## Bad
~~~~
if strings.Index(s, "x") != -1 {
~~~~

## Good
~~~~
if strings.Contains(s, "x") {
~~~~
