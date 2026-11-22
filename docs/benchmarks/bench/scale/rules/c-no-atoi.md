---
kind: forbid
pattern: '(?<![\w.])atoi\('
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Use strtol with error checks instead of atoi.

## Bad
~~~~
int port = atoi(argv[1]);
~~~~

## Good
~~~~
long port = strtol(argv[1], &end, 10);
~~~~
