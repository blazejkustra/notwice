---
kind: forbid
pattern: '(?<![\w.])gets\('
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Never use gets; use fgets.

## Bad
~~~~
gets(buffer);
~~~~

## Good
~~~~
fgets(buffer, sizeof buffer, stdin);
~~~~
