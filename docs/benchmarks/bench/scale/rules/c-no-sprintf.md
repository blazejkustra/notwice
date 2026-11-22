---
kind: forbid
pattern: '(?<![\w.])sprintf\('
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Use snprintf instead of sprintf.

## Bad
~~~~
sprintf(buf, "%d", n);
~~~~

## Good
~~~~
snprintf(buf, sizeof buf, "%d", n);
~~~~
