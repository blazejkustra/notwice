---
kind: forbid
pattern: '^\s*(?:import\s+numpy\.matlib(?:\s|\.|,|$)|from\s+numpy\.matlib(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace numpy.matlib with numpy arrays.

## Bad
~~~~
import numpy.matlib
~~~~

## Good
~~~~
import numpy as np
~~~~
