---
kind: forbid
pattern: 'tabIndex=\{?\s*["'']?[1-9]'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Never use a positive tabIndex.

## Bad
~~~~
<div tabIndex={3}>
~~~~

## Good
~~~~
<div tabIndex={0}>
~~~~
