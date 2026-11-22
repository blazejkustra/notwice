---
kind: forbid
pattern: '@Transactional\s+private\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
@Transactional has no effect on private methods.

## Bad
~~~~
@Transactional private void save() {
~~~~

## Good
~~~~
@Transactional public void save() {
~~~~
