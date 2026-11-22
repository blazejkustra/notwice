---
kind: forbid
pattern: '==\s*"[^"]*"|"[^"]*"\s*=='
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Compare strings with equals(), never ==.

## Bad
~~~~
if (status == "active") {
~~~~

## Good
~~~~
if ("active".equals(status)) {
~~~~
