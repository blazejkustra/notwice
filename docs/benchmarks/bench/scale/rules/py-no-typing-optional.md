---
kind: forbid
pattern: '\bOptional\['
targets: [files]
paths: ['*.py']
severity: warn
from: benchmark distractor (language)
---
Write X | None instead of Optional[X].

## Bad
~~~~
def find(id: int) -> Optional[User]:
~~~~

## Good
~~~~
def find(id: int) -> User | None:
~~~~
