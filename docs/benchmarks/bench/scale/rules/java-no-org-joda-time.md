---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?org\.joda\.time\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on org.joda.time; reach for java.time.

## Bad
~~~~
import org.joda.time;
~~~~

## Good
~~~~
import java.time.LocalDate;
~~~~
