---
kind: forbid
pattern: '\bsha256~[A-Za-z0-9_-]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A OpenShift user token belongs in the secret manager, never in the repo. Reference OPENSHIFT_TOKEN instead.

## Bad
~~~~
OPENSHIFT_TOKEN=sha256~SffJhvHYEp5JUqi5FfkwtxEIWY2yLesjLLLyHFGeLLp
~~~~

## Good
~~~~
OPENSHIFT_TOKEN=${OPENSHIFT_TOKEN}
~~~~
