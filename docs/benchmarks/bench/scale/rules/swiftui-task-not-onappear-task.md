---
kind: forbid
pattern: '\.onAppear\s*\{\s*Task\s*\{'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (framework)
---
Use the .task modifier instead of starting a Task in onAppear.

## Bad
~~~~
.onAppear { Task { await load() } }
~~~~

## Good
~~~~
.task { await load() }
~~~~
