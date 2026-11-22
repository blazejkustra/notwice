---
kind: forbid
pattern: '^\s*(?:import\s+boto(?:\s|\.|,|$)|from\s+boto(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on boto; reach for boto3.

## Bad
~~~~
import boto
~~~~

## Good
~~~~
import boto3
~~~~
