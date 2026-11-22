---
kind: forbid
pattern: '\b(?:struct|class|enum|protocol|actor)\s+[a-z]\w*'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (naming)
---
Swift type names are UpperCamelCase.

## Bad
~~~~
struct userProfile {
~~~~

## Good
~~~~
struct UserProfile {
~~~~
