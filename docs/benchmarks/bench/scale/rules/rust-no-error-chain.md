---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+error_chain::|^\s*extern\s+crate\s+error_chain\b|^error-chain\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Replace error_chain with thiserror.

## Bad
~~~~
use error_chain::Thing;
~~~~

## Good
~~~~
use thiserror::Error;
~~~~
