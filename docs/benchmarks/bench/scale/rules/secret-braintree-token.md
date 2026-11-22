---
kind: forbid
pattern: 'access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Braintree production token belongs in the secret manager, never in the repo. Reference BRAINTREE_TOKEN instead.

## Bad
~~~~
BRAINTREE_TOKEN=access_token$production$e99jlpor1phczhcm$218ed2ba3323b178b3cd527c2c818e1c
~~~~

## Good
~~~~
BRAINTREE_TOKEN=${BRAINTREE_TOKEN}
~~~~
