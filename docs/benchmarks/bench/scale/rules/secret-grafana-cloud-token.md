---
kind: forbid
pattern: '\bglc_[A-Za-z0-9+/]{32,400}={0,2}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Grafana Cloud token belongs in the secret manager, never in the repo. Reference GRAFANA_CLOUD_TOKEN instead.

## Bad
~~~~
GRAFANA_CLOUD_TOKEN=glc_YFJsSiOCfF80XQiHu9VMgmciXtbLwhJsCtdVu3QBm56cM4KIs4il7P7Zl01p623ttz5JGLEfFb8heBGP
~~~~

## Good
~~~~
GRAFANA_CLOUD_TOKEN=${GRAFANA_CLOUD_TOKEN}
~~~~
