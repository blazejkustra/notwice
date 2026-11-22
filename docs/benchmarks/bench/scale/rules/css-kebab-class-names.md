---
kind: forbid
pattern: '^\s*\.[a-z]+[A-Z]\w*\s*[{,]'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (naming)
---
CSS class names are kebab-case.

## Bad
~~~~
.cardTitle {
~~~~

## Good
~~~~
.card-title {
~~~~
