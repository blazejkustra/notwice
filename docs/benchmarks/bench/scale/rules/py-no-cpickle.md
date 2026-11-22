---
kind: forbid
pattern: '^\s*(?:import\s+cPickle(?:\s|\.|,|$)|from\s+cPickle(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace cPickle with json.

## Bad
~~~~
import cPickle
~~~~

## Good
~~~~
import json
~~~~
