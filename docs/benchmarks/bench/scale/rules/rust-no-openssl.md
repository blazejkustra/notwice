---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+openssl::|^\s*extern\s+crate\s+openssl\b|^openssl\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Do not import openssl; use rustls.

## Bad
~~~~
use openssl::Thing;
~~~~

## Good
~~~~
use rustls::ClientConfig;
~~~~
