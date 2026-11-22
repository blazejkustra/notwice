---
kind: forbid
pattern: '#!?\[allow\(clippy::(?:all|pedantic|nursery)\)\]'
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Never silence clippy wholesale; allow one lint with a reason.

## Bad
~~~~
#![allow(clippy::all)]
~~~~

## Good
~~~~
#[expect(clippy::too_many_arguments, reason = "mirrors the C API")]
~~~~
