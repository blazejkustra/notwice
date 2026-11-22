---
kind: forbid
pattern: '\b(?:friendly|gentle) (?:ping|reminder)\b'
flags: i
targets: [comments]
severity: block
from: benchmark distractor (git)
---
No "friendly ping" comments; ask a concrete question.

## Bad
~~~~
Friendly ping on this!
~~~~

## Good
~~~~
Can you confirm the API change is fine for mobile?
~~~~
