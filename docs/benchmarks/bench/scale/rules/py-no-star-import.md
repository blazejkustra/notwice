---
kind: forbid
pattern: '^\s*from\s+\S+\s+import\s+\*'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
No wildcard imports.

## Bad
~~~~
from utils import *
~~~~

## Good
~~~~
from utils import slugify
~~~~
