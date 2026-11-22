---
kind: forbid
pattern: '(?:Char|Text)Field\([^)]*null\s*=\s*True'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Text fields use blank=True and an empty string, not null=True.

## Bad
~~~~
name = models.CharField(max_length=80, null=True)
~~~~

## Good
~~~~
name = models.CharField(max_length=80, blank=True)
~~~~
