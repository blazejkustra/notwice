---
kind: forbid
pattern: '^\t+'
targets: [files]
paths: ['*.{yml,yaml}']
severity: block
from: benchmark distractor (infra)
---
YAML files are indented with spaces, never tabs.

## Bad
~~~~
	name: api
~~~~

## Good
~~~~
  name: api
~~~~
