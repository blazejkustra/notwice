---
kind: forbid
pattern: '\b[0-9]/[0-9]{16}:[A-Za-z0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Asana personal access token belongs in the secret manager, never in the repo. Reference ASANA_TOKEN instead.

## Bad
~~~~
ASANA_TOKEN=1/8927772809894474:kBP9ebGlKxBm9vsWV3j4fByYIy8yG1Um
~~~~

## Good
~~~~
ASANA_TOKEN=${ASANA_TOKEN}
~~~~
