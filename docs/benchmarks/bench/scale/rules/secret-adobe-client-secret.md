---
kind: forbid
pattern: '\bp8e-[A-Za-z0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Adobe client secret belongs in the secret manager, never in the repo. Reference ADOBE_CLIENT_SECRET instead.

## Bad
~~~~
ADOBE_CLIENT_SECRET=p8e-kdBHTrEYmfQlDop0a1nZEbRNFfrN1wmq
~~~~

## Good
~~~~
ADOBE_CLIENT_SECRET=${ADOBE_CLIENT_SECRET}
~~~~
