---
kind: forbid
pattern: '\bmem::transmute\b|\btransmute::<'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
No transmute; use safe conversions.

## Bad
~~~~
let n: u32 = unsafe { std::mem::transmute(bytes) };
~~~~

## Good
~~~~
let n = u32::from_le_bytes(bytes);
~~~~
