---
kind: forbid
pattern: '\bdapi[a-f0-9]{32}(?:-\d)?\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Databricks token belongs in the secret manager, never in the repo. Reference DATABRICKS_TOKEN instead.

## Bad
~~~~
DATABRICKS_TOKEN=dapi22d9fdc1a05910742e81428171de74d3
~~~~

## Good
~~~~
DATABRICKS_TOKEN=${DATABRICKS_TOKEN}
~~~~
