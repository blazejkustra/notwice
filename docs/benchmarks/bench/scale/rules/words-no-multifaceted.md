---
kind: forbid
pattern: '\bmultifaceted\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "multifaceted" from anything posted to GitHub; name the facets.

## Bad
~~~~
multifaceted
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
