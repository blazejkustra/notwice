---
kind: forbid
pattern: '^\s*(?:import\s+xml\.dom\.minidom(?:\s|\.|,|$)|from\s+xml\.dom\.minidom(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on xml.dom.minidom; reach for defusedxml.minidom.

## Bad
~~~~
import xml.dom.minidom
~~~~

## Good
~~~~
import defusedxml.minidom
~~~~
