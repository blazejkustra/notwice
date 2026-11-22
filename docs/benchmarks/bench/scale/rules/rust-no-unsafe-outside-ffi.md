---
kind: forbid
pattern: '^\s*unsafe\s*\{'
targets: [files]
paths: ['src/**/*.rs']
severity: block
from: benchmark distractor (language)
---
No unsafe blocks outside the ffi module.

## Bad
~~~~
unsafe { ptr.read() }
~~~~

## Good
~~~~
let value = slice[index];
~~~~
