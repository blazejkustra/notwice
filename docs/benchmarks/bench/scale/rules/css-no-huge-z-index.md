---
kind: forbid
pattern: 'z-index:\s*(?:\d{4,}|[2-9]\d\d)\b'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (language)
---
Use the z-index scale tokens; no values above 100.

## Bad
~~~~
z-index: 9999;
~~~~

## Good
~~~~
z-index: var(--z-modal);
~~~~
