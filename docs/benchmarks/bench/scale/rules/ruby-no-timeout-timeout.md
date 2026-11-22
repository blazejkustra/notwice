---
kind: forbid
pattern: '\bTimeout\.timeout\('
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (language)
---
Timeout.timeout is unsafe; use library-level timeouts.

## Bad
~~~~
Timeout.timeout(5) { fetch }
~~~~

## Good
~~~~
http.read_timeout = 5
~~~~
