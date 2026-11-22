---
kind: forbid
pattern: '!important\b'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (language)
---
No !important; fix the specificity instead.

## Bad
~~~~
color: red !important;
~~~~

## Good
~~~~
color: var(--color-danger);
~~~~
