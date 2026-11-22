---
kind: forbid
pattern: '\bapi-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A LaunchDarkly API key belongs in the secret manager, never in the repo. Reference LAUNCHDARKLY_API_KEY instead.

## Bad
~~~~
LAUNCHDARKLY_API_KEY=api-dde8cd63-cb8e-6fc6-d194-e524e88b6a28
~~~~

## Good
~~~~
LAUNCHDARKLY_API_KEY=${LAUNCHDARKLY_API_KEY}
~~~~
