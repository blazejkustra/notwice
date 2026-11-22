---
kind: forbid
pattern: 'System\.(?:out|err)\.print'
targets: [files]
paths: ['src/main/**/*.java']
severity: block
from: benchmark distractor (language)
---
Use SLF4J, not System.out or System.err.

## Bad
~~~~
System.out.println("Started")
~~~~

## Good
~~~~
log.info("Started")
~~~~
