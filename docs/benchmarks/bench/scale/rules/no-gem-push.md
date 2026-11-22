---
kind: forbid
pattern: '\bgem\s+push\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Only the release workflow pushes gems.

## Bad
~~~~
gem push pkg/app-1.0.gem
~~~~

## Good
~~~~
gem build app.gemspec
~~~~
