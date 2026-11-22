---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?org\.junit\.Test\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Replace org.junit.Test with org.junit.jupiter.api.Test.

## Bad
~~~~
import org.junit.Test;
~~~~

## Good
~~~~
import org.junit.jupiter.api.Test;
~~~~
