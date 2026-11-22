---
kind: forbid
pattern: '^\s*(?:import\s+Crypto(?:\s|\.|,|$)|from\s+Crypto(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Do not import Crypto; use the cryptography package.

## Bad
~~~~
import Crypto
~~~~

## Good
~~~~
from cryptography.fernet import Fernet
~~~~
