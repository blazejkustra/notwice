---
kind: forbid
pattern: '\bredis-cli\b[^;&|\n]*\bFLUSH(?:ALL|DB)\b'
flags: i
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never flush Redis.

## Bad
~~~~
redis-cli FLUSHALL
~~~~

## Good
~~~~
redis-cli INFO keyspace
~~~~
