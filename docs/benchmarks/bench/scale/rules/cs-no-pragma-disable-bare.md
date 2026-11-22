---
kind: forbid
pattern: '#pragma\s+warning\s+disable\s*$'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (language)
---
#pragma warning disable must name the warnings.

## Bad
~~~~
#pragma warning disable
~~~~

## Good
~~~~
#pragma warning disable CS0618 // migrating in API-12
~~~~
