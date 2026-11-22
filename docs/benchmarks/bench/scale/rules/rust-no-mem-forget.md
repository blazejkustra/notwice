---
kind: forbid
pattern: '\bmem::forget\('
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Do not use mem::forget; use ManuallyDrop if you must.

## Bad
~~~~
std::mem::forget(guard);
~~~~

## Good
~~~~
let guard = ManuallyDrop::new(guard);
~~~~
