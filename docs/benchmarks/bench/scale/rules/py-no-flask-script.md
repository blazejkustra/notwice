---
kind: forbid
pattern: '^\s*(?:import\s+flask_script(?:\s|\.|,|$)|from\s+flask_script(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Do not import flask_script; use the flask CLI.

## Bad
~~~~
import flask_script
~~~~

## Good
~~~~
import click
~~~~
