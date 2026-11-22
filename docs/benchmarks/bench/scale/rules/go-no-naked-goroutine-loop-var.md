---
kind: forbid
pattern: 'go\s+func\(\)\s*\{[^}]*\b(?:i|v|item)\b'
targets: [files]
paths: ['*.go']
severity: warn
from: benchmark distractor (language)
---
Pass loop values to goroutines explicitly.

## Bad
~~~~
go func() { process(item) }()
~~~~

## Good
~~~~
go func(item Item) { process(item) }(item)
~~~~
