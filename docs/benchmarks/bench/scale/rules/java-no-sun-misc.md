---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?sun\.misc\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
sun.misc is banned in this codebase. Use supported JDK APIs (java.util.Base64, VarHandle) instead.

## Bad
~~~~
import sun.misc;
~~~~

## Good
~~~~
import java.util.Base64;
~~~~
