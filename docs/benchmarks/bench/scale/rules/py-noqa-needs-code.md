---
kind: forbid
pattern: '#\s*noqa(?!:)\s*$'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
# noqa must name the rule code it silences.

## Bad
~~~~
import os  # noqa
~~~~

## Good
~~~~
import os  # noqa: F401
~~~~
