---
kind: forbid
pattern: '^\s*(?:LGTM|lgtm|\+1|:\+1:|bump)\s*!?\s*$'
targets: [comments]
severity: block
from: benchmark distractor (git)
---
Review comments say what you checked, not just LGTM or +1.

## Bad
~~~~
LGTM
~~~~

## Good
~~~~
Checked the retry path locally; the backoff caps at 30 s.
~~~~
