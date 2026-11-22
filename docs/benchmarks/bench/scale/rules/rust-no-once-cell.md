---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+once_cell::|^\s*extern\s+crate\s+once_cell\b|^once-cell\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Do not import once_cell; use std::sync::OnceLock.

## Bad
~~~~
use once_cell::Thing;
~~~~

## Good
~~~~
use std::sync::OnceLock;
~~~~
