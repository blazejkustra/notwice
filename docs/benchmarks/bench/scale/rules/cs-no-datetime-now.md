---
kind: forbid
pattern: '\bDateTime\.Now\b'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
Use DateTime.UtcNow or an injected TimeProvider, not DateTime.Now.

## Bad
~~~~
var created = DateTime.Now;
~~~~

## Good
~~~~
var created = _time.GetUtcNow();
~~~~
