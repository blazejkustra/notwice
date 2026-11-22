---
kind: forbid
pattern: '\bautoFocus\b'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Avoid autoFocus; it disorients screen reader users.

## Bad
~~~~
<input autoFocus />
~~~~

## Good
~~~~
<input />
~~~~
