---
kind: forbid
pattern: '^\s*\*\s*\{\s*margin:\s*0'
targets: [files]
paths: ['*.{css,scss,sass,less}']
severity: block
from: benchmark distractor (language)
---
Use the shared reset file; no ad hoc universal resets.

## Bad
~~~~
* { margin: 0; }
~~~~

## Good
~~~~
@import "./reset.css";
~~~~
