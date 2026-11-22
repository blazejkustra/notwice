---
kind: forbid
pattern: '\bThread\.Sleep\('
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Use await Task.Delay instead of Thread.Sleep.

## Bad
~~~~
Thread.Sleep(1000);
~~~~

## Good
~~~~
await Task.Delay(1000, ct);
~~~~
