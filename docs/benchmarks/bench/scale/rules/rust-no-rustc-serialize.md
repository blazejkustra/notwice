---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+rustc_serialize::|^\s*extern\s+crate\s+rustc_serialize\b|^rustc-serialize\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Do not import rustc_serialize; use serde.

## Bad
~~~~
use rustc_serialize::Thing;
~~~~

## Good
~~~~
use serde::Deserialize;
~~~~
