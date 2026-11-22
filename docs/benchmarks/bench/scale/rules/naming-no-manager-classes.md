---
kind: forbid
pattern: '\bclass\s+\w+(?:Manager|Helper|Util)\b'
targets: [files]
paths: ['*.{kt,kts}']
severity: block
from: benchmark distractor (naming)
---
Avoid Manager, Helper and Util class names; name the responsibility.

## Bad
~~~~
class SessionManager(
~~~~

## Good
~~~~
class SessionStore(
~~~~
