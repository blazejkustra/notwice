---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+tempdir::|^\s*extern\s+crate\s+tempdir\b|^tempdir\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on tempdir; reach for tempfile.

## Bad
~~~~
use tempdir::Thing;
~~~~

## Good
~~~~
use tempfile::TempDir;
~~~~
