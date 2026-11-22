---
kind: forbid
pattern: '\bgit\s+(?:checkout\s+-b|switch\s+-c|branch)\s+\S*[A-Z_]'
targets: [commands]
severity: block
from: benchmark distractor (naming)
---
Branch names are lowercase-kebab, for example fix/upload-retry.

## Bad
~~~~
git checkout -b Fix_Upload
~~~~

## Good
~~~~
git checkout -b fix/upload-retry
~~~~
