---
kind: forbid
pattern: '\bNavigationView\s*\{'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
NavigationView is deprecated; use NavigationStack.

## Bad
~~~~
NavigationView {
~~~~

## Good
~~~~
NavigationStack {
~~~~
