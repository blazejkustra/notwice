---
kind: forbid
pattern: '(?:^|\s)\*\*?\s[^*]+\s\*\*?(?:\s|$)'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
No spaces inside emphasis markers (MD037).

## Bad
~~~~
This is ** important ** text
~~~~

## Good
~~~~
This is **important** text
~~~~
