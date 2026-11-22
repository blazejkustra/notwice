---
kind: forbid
pattern: '\bdbg!\('
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Remove dbg!() before committing.

## Bad
~~~~
let total = dbg!(a + b);
~~~~

## Good
~~~~
let total = a + b;
~~~~
