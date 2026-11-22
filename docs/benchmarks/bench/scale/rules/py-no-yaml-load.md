---
kind: forbid
pattern: '\byaml\.load\((?![^)]*Loader=yaml\.SafeLoader)'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Use yaml.safe_load, never yaml.load.

## Bad
~~~~
config = yaml.load(stream)
~~~~

## Good
~~~~
config = yaml.safe_load(stream)
~~~~
