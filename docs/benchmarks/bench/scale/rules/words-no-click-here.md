---
kind: forbid
pattern: '\[click here\]|\[here\]\('
flags: i
targets: [files]
paths: ['*.{md,mdx,txt}']
severity: block
from: benchmark distractor (writing)
---
Cut "[click here]" from anything posted to GitHub; link descriptive text.

## Bad
~~~~
[click here]
~~~~

## Good
~~~~
Update the uploader retry logic.
~~~~
