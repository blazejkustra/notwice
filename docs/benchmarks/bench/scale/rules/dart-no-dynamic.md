---
kind: forbid
pattern: '\bdynamic\s+\w+\s*[=;]'
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
Avoid dynamic variables; give them a type.

## Bad
~~~~
dynamic json = decode(body);
~~~~

## Good
~~~~
final Map<String, Object?> json = decode(body);
~~~~
