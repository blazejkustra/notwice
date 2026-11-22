---
kind: forbid
pattern: '^\s*(?:import\s+distutils(?:\s|\.|,|$)|from\s+distutils(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Do not import distutils; use setuptools or sysconfig.

## Bad
~~~~
import distutils
~~~~

## Good
~~~~
import sysconfig
~~~~
