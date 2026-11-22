---
kind: forbid
pattern: 'readOnlyRootFilesystem:\s*false\b'
targets: [files]
paths: ['k8s/**/*.{yml,yaml}', 'deploy/**/*.{yml,yaml}', 'charts/**/*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
Use readOnlyRootFilesystem: true.

## Bad
~~~~
          readOnlyRootFilesystem: false
~~~~

## Good
~~~~
          readOnlyRootFilesystem: true
~~~~
