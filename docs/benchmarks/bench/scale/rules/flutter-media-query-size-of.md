---
kind: forbid
pattern: 'MediaQuery\.of\(context\)\.size\b'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
Use MediaQuery.sizeOf(context) to avoid extra rebuilds.

## Bad
~~~~
final width = MediaQuery.of(context).size.width;
~~~~

## Good
~~~~
final width = MediaQuery.sizeOf(context).width;
~~~~
