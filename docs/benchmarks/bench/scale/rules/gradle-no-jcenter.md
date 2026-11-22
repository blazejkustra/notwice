---
kind: forbid
pattern: '\bjcenter\(\)'
targets: [files]
paths: ['*.gradle', '*.gradle.kts']
severity: block
from: benchmark distractor (infra)
---
jcenter() is shut down; use mavenCentral().

## Bad
~~~~
    jcenter()
~~~~

## Good
~~~~
    mavenCentral()
~~~~
