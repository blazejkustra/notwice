---
kind: forbid
pattern: '^\s*(?:import\s+xml\.etree(?:\s|\.|,|$)|from\s+xml\.etree(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace xml.etree with defusedxml.

## Bad
~~~~
import xml.etree
~~~~

## Good
~~~~
import defusedxml.ElementTree as ET
~~~~
