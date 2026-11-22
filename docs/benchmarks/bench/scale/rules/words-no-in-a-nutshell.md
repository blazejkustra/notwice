---
kind: forbid
pattern: '\bin a nutshell\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "in a nutshell" from anything posted to GitHub; write the summary.

## Bad
~~~~
in a nutshell
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
