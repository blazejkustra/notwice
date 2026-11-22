---
kind: forbid
pattern: '^\s*(?:import\s+cgi(?:\s|\.|,|$)|from\s+cgi(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace cgi with email.message or a web framework.

## Bad
~~~~
import cgi
~~~~

## Good
~~~~
from email.message import EmailMessage
~~~~
