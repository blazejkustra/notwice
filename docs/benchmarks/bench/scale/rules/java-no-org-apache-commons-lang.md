---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?org\.apache\.commons\.lang\.'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
org.apache.commons.lang. is banned in this codebase. Use commons-lang3 instead.

## Bad
~~~~
import org.apache.commons.lang.Legacy;
~~~~

## Good
~~~~
import org.apache.commons.lang3.StringUtils;
~~~~
