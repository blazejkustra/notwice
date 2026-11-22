---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?javax\.persistence\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Do not import javax.persistence; use jakarta.persistence.

## Bad
~~~~
import javax.persistence;
~~~~

## Good
~~~~
import jakarta.persistence.Entity;
~~~~
