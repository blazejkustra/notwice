---
kind: forbid
pattern: '^\s*#[a-zA-Z][\w-]*\s*[{,]'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (language)
---
Do not style by id; use classes.

## Bad
~~~~
#header {
~~~~

## Good
~~~~
.site-header {
~~~~
