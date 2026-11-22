---
kind: forbid
pattern: '\.unwrap\(\)'
targets: [files]
paths: ['src/**/*.rs']
severity: block
from: benchmark distractor (language)
---
No unwrap() in library code; propagate the error with ?.

## Bad
~~~~
let file = File::open(path).unwrap();
~~~~

## Good
~~~~
let file = File::open(path)?;
~~~~
