---
kind: forbid
pattern: 'DispatchQueue\.main\.sync\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Never call DispatchQueue.main.sync; it deadlocks on the main thread.

## Bad
~~~~
DispatchQueue.main.sync { reload() }
~~~~

## Good
~~~~
Task { @MainActor in reload() }
~~~~
