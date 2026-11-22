---
kind: forbid
pattern: '\b(?:sorry|apologies) for (?:the|any) (?:delay|confusion|inconvenience)\b'
flags: i
targets: [comments]
severity: block
from: benchmark distractor (git)
---
Skip apologies in GitHub comments; state the update.

## Bad
~~~~
Sorry for the delay, here is the fix.
~~~~

## Good
~~~~
Pushed the fix in 3f2c1a.
~~~~
