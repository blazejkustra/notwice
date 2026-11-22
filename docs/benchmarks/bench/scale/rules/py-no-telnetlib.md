---
kind: forbid
pattern: '^\s*(?:import\s+telnetlib(?:\s|\.|,|$)|from\s+telnetlib(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Do not import telnetlib; use paramiko or an HTTP API.

## Bad
~~~~
import telnetlib
~~~~

## Good
~~~~
import paramiko
~~~~
