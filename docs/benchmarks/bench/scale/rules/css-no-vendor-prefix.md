---
kind: forbid
pattern: '^\s*-(?:webkit|moz|ms)-(?:border-radius|box-shadow|transition|transform)\b'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (naming)
---
Autoprefixer adds vendor prefixes; do not write them.

## Bad
~~~~
-webkit-border-radius: 4px;
~~~~

## Good
~~~~
border-radius: 4px;
~~~~
