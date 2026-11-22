---
kind: forbid
pattern: '\bGC\.Collect\('
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Never call GC.Collect().

## Bad
~~~~
GC.Collect();
~~~~

## Good
~~~~
buffer.Dispose();
~~~~
