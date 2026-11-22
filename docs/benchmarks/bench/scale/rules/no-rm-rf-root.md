---
kind: forbid
pattern: '\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?[a-zA-Z]*\s+(?:/|~|\$HOME|/\*)(?:\s|$)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never rm -rf the root or home folder.

## Bad
~~~~
rm -rf ~
~~~~

## Good
~~~~
rm -rf ./build
~~~~
