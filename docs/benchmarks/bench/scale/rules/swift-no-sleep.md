---
kind: forbid
pattern: '(?<![\w.])(?:usleep|sleep)\(\d|Thread\.sleep\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Never block a thread with sleep; use Task.sleep.

## Bad
~~~~
Thread.sleep(forTimeInterval: 1)
~~~~

## Good
~~~~
try await Task.sleep(for: .seconds(1))
~~~~
