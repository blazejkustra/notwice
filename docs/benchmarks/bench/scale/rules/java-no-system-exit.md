---
kind: forbid
pattern: '\bSystem\.exit\('
targets: [files]
paths: ['src/main/**/*.java']
severity: block
from: benchmark distractor (language)
---
Never call System.exit in application code.

## Bad
~~~~
System.exit(1);
~~~~

## Good
~~~~
throw new IllegalStateException("missing config");
~~~~
