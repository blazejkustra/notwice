---
kind: forbid
pattern: '\bATATT3[A-Za-z0-9_=-]{186}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Atlassian API token. Read it from ATLASSIAN_API_TOKEN at runtime.

## Bad
~~~~
ATLASSIAN_API_TOKEN=ATATT3C0EoHmY3FeSYIrBDiMvMprdFhSyHeuPAXbLqcDp4J1CIaFrzMpoIGmUzP7K94g6wf6AU8skjSUr7vYosYkMl47hTxidsAi4bfcTNpqAmP5Lqas0ct8VyIr3C1cC22kGzIMYAfCRDOHPonUUtEhrffsrDQ9Ayyf6lMBNUuH9scwbrEKwyAPHwVHWkaa
~~~~

## Good
~~~~
ATLASSIAN_API_TOKEN=${ATLASSIAN_API_TOKEN}
~~~~
