---
kind: forbid
pattern: '#\[ignore\]'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
#[ignore] needs a reason: #[ignore = "why"].

## Bad
~~~~
#[ignore]
~~~~

## Good
~~~~
#[ignore = "needs network"]
~~~~
