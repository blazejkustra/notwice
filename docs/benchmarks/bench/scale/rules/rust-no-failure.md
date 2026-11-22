---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+failure::|^\s*extern\s+crate\s+failure\b|^failure\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Do not import failure; use thiserror or anyhow.

## Bad
~~~~
use failure::Thing;
~~~~

## Good
~~~~
use thiserror::Error;
~~~~
