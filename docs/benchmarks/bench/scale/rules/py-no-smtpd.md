---
kind: forbid
pattern: '^\s*(?:import\s+smtpd(?:\s|\.|,|$)|from\s+smtpd(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on smtpd; reach for aiosmtpd.

## Bad
~~~~
import smtpd
~~~~

## Good
~~~~
import aiosmtpd
~~~~
