---
kind: forbid
pattern: '^\s*import\s+(?:static\s+)?com\.google\.common\.base\.Optional\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (dependencies)
---
Replace com.google.common.base.Optional with java.util.Optional.

## Bad
~~~~
import com.google.common.base.Optional;
~~~~

## Good
~~~~
import java.util.Optional;
~~~~
