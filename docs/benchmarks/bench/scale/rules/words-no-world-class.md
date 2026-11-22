---
kind: forbid
pattern: '\b(?:world|best)[ -]in[ -]class\b|\bworld[ -]class\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
"world-class" is banned in commit messages and PR text: show the evidence.

## Bad
~~~~
world-class
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
