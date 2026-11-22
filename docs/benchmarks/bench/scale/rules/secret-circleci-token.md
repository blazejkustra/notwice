---
kind: forbid
pattern: '\bCCIPAT_[A-Za-z0-9]{22}_[a-f0-9]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a CircleCI personal token. Read it from CIRCLECI_TOKEN at runtime.

## Bad
~~~~
CIRCLECI_TOKEN=CCIPAT_ss0SZ5zYcHUTrxM9DqLVBA_381e25837335e3aad875132fef5b12c79ee26fca
~~~~

## Good
~~~~
CIRCLECI_TOKEN=${CIRCLECI_TOKEN}
~~~~
