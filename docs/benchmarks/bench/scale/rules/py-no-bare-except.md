---
kind: forbid
pattern: '^\s*except\s*:'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Catch a specific exception; never write a bare except:.

## Bad
~~~~
except:
~~~~

## Good
~~~~
except ValueError:
~~~~
