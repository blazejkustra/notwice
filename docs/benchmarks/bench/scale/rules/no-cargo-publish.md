---
kind: forbid
pattern: '\bcargo\s+publish\b(?![^;&|\n]*--dry-run)'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the release workflow publishes crates.

## Bad
~~~~
cargo publish
~~~~

## Good
~~~~
cargo publish --dry-run
~~~~
