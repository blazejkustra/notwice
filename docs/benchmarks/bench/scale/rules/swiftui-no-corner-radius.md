---
kind: forbid
pattern: '\.cornerRadius\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
cornerRadius is deprecated; use clipShape(.rect(cornerRadius:)).

## Bad
~~~~
.cornerRadius(12)
~~~~

## Good
~~~~
.clipShape(.rect(cornerRadius: 12))
~~~~
