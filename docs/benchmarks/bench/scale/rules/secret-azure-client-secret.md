---
kind: forbid
pattern: '\b[a-zA-Z0-9_~.]{3}\dQ~[a-zA-Z0-9_~.-]{31,34}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Azure AD client secret belongs in the secret manager, never in the repo. Reference AZURE_CLIENT_SECRET instead.

## Bad
~~~~
AZURE_CLIENT_SECRET=abc8Q~cUBULzEDd06oNwBlqokyPxjTnt94uqaIjD
~~~~

## Good
~~~~
AZURE_CLIENT_SECRET=${AZURE_CLIENT_SECRET}
~~~~
