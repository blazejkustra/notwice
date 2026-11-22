---
kind: forbid
pattern: '^\s*println\('
targets: [files]
paths: ['src/main/**/*.kt']
severity: block
from: benchmark distractor (language)
---
Use the logger instead of println in app code.

## Bad
~~~~
println("sync done")
~~~~

## Good
~~~~
logger.info { "sync done" }
~~~~
