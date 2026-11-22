---
kind: forbid
pattern: 'scanf\(\s*"%s"'
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Never read strings with scanf("%s"); bound the width.

## Bad
~~~~
scanf("%s", name);
~~~~

## Good
~~~~
scanf("%63s", name);
~~~~
