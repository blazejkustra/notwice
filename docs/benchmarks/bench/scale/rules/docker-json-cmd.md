---
kind: forbid
pattern: '^(?:CMD|ENTRYPOINT)\s+[^\[\s]'
targets: [files]
paths: ['Dockerfile', 'Dockerfile.*', '*.Dockerfile']
severity: block
from: benchmark distractor (infra)
---
Use JSON form for CMD and ENTRYPOINT (DL3025).

## Bad
~~~~
CMD node server.js
~~~~

## Good
~~~~
CMD ["node", "server.js"]
~~~~
