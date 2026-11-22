---
kind: forbid
pattern: '\bTime\.now\b|\bDate\.today\b'
targets: [files]
paths: ['app/**/*.rb']
severity: block
from: benchmark distractor (framework)
---
Use Time.current and Date.current so the app time zone applies.

## Bad
~~~~
expires_at = Time.now + 1.hour
~~~~

## Good
~~~~
expires_at = Time.current + 1.hour
~~~~
