---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?java\.util\.Date\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Replace java.util.Date with java.time.

## Bad
~~~~
import java.util.Date;
~~~~

## Good
~~~~
import java.time.Instant;
~~~~
