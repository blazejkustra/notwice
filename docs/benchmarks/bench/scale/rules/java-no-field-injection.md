---
kind: forbid
pattern: '@Autowired\s+private\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (language)
---
Use constructor injection, not field injection.

## Bad
~~~~
@Autowired private UserRepository users;
~~~~

## Good
~~~~
private final UserRepository users;
~~~~
