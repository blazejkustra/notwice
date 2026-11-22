---
kind: forbid
pattern: '^\s*import\s+i?pdb\b|\bbreakpoint\(\)|pdb\.set_trace\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Remove pdb and breakpoint() calls before committing.

## Bad
~~~~
import pdb; pdb.set_trace()
~~~~

## Good
~~~~
logger.debug("state: %s", state)
~~~~
