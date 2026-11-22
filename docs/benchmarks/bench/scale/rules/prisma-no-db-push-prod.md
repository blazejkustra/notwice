---
kind: forbid
pattern: 'previewFeatures\s*=\s*\[[^\]]*"referentialIntegrity"'
targets: [files]
paths: ['*.prisma']
severity: block
from: benchmark distractor (language)
---
referentialIntegrity is renamed relationMode in Prisma.

## Bad
~~~~
previewFeatures = ["referentialIntegrity"]
~~~~

## Good
~~~~
relationMode = "prisma"
~~~~
