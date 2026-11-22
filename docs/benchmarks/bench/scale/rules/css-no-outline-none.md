---
kind: forbid
pattern: 'outline:\s*(?:none|0)\s*;'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (language)
---
Never remove focus outlines without a replacement focus style.

## Bad
~~~~
outline: none;
~~~~

## Good
~~~~
outline: 2px solid var(--focus-ring);
~~~~
