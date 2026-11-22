---
kind: forbid
pattern: '\bglsa_[A-Za-z0-9]{32}_[A-Fa-f0-9]{8}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Grafana service account token belongs in the secret manager, never in the repo. Reference GRAFANA_SA_TOKEN instead.

## Bad
~~~~
GRAFANA_SA_TOKEN=glsa_l1K18t9b9t59h63F2dSOpdHiMRWmBTPU_67001737
~~~~

## Good
~~~~
GRAFANA_SA_TOKEN=${GRAFANA_SA_TOKEN}
~~~~
