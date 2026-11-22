---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?java\.text\.SimpleDateFormat\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Do not import java.text.SimpleDateFormat; use java.time.format.DateTimeFormatter.

## Bad
~~~~
import java.text.SimpleDateFormat;
~~~~

## Good
~~~~
import java.time.format.DateTimeFormatter;
~~~~
