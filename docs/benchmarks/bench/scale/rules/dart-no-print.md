---
kind: forbid
pattern: '^\s*print\('
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
Use debugPrint or a logger instead of print.

## Bad
~~~~
print("tapped");
~~~~

## Good
~~~~
debugPrint("tapped");
~~~~
