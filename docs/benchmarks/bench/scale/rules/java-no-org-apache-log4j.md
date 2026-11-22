---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?org\.apache\.log4j\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Do not import org.apache.log4j; use SLF4J.

## Bad
~~~~
import org.apache.log4j;
~~~~

## Good
~~~~
import org.slf4j.Logger;
~~~~
