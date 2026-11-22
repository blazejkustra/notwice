---
kind: forbid
pattern: '^(?:Certainly|Absolutely|Of course)!'
flags: i
targets: [commits, pr, comments]
severity: block
from: benchmark distractor (writing)
---
Cut "Certainly!" from anything posted to GitHub; start with the content.

## Bad
~~~~
Certainly!
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
