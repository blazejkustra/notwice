---
kind: forbid
pattern: '\.send\(\s*params\['
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (security)
---
Never call send with user input.

## Bad
~~~~
record.send(params[:field])
~~~~

## Good
~~~~
record.public_send(ALLOWED.fetch(params[:field]))
~~~~
