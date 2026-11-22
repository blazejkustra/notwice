---
kind: forbid
pattern: '(?<![\w.])(?:strcpy|strcat)\('
targets: [files]
paths: ['*.{c,h}']
severity: block
from: benchmark distractor (language)
---
Use bounded copies (strlcpy or snprintf), not strcpy or strcat.

## Bad
~~~~
strcpy(dest, src);
~~~~

## Good
~~~~
strlcpy(dest, src, sizeof dest);
~~~~
