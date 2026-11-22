---
kind: forbid
pattern: '\bit(?:''s| is) (?:important|worth) (?:to note|noting)\b'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "it's worth noting" from anything posted to GitHub; state the point.

## Bad
~~~~
it's worth noting
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
