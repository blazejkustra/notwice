---
kind: forbid
pattern: '\blive_[a-f0-9]{35}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Lob live key anywhere in the repo or on GitHub; pass it through LOB_API_KEY.

## Bad
~~~~
LOB_API_KEY=live_f4def4bb01dd218e1d796c552f4156a64b2
~~~~

## Good
~~~~
LOB_API_KEY=${LOB_API_KEY}
~~~~
