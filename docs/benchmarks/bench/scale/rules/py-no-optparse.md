---
kind: forbid
pattern: '^\s*(?:import\s+optparse(?:\s|\.|,|$)|from\s+optparse(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on optparse; reach for argparse.

## Bad
~~~~
import optparse
~~~~

## Good
~~~~
import argparse
~~~~
