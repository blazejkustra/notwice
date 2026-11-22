---
kind: forbid
pattern: '\.[a-z-]+__[a-z-]+__[a-z-]+'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (naming)
---
BEM blocks nest one element level only.

## Bad
~~~~
.card__header__title {
~~~~

## Good
~~~~
.card__title {
~~~~
