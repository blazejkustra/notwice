---
kind: forbid
pattern: '<br\s*/?>'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Use a blank line, not <br>.

## Bad
~~~~
Line one<br>Line two
~~~~

## Good
~~~~
Line one
~~~~
