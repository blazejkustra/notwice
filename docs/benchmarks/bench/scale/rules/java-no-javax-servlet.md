---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?javax\.servlet\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Replace javax.servlet with jakarta.servlet.

## Bad
~~~~
import javax.servlet;
~~~~

## Good
~~~~
import jakarta.servlet.http.HttpServletRequest;
~~~~
