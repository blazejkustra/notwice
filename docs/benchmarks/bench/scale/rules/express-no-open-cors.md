---
kind: forbid
pattern: '\bcors\(\s*\)'
targets: [files]
paths: ['server/**', 'src/server/**', 'api/**']
severity: block
from: benchmark distractor (framework)
---
Configure CORS with an explicit origin list.

## Bad
~~~~
app.use(cors())
~~~~

## Good
~~~~
app.use(cors({ origin: allowedOrigins }))
~~~~
