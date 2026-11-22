---
kind: forbid
pattern: 'protected\s+void\s+finalize\(\)'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Do not override finalize(); use try-with-resources or Cleaner.

## Bad
~~~~
protected void finalize() {
~~~~

## Good
~~~~
public void close() {
~~~~
