---
kind: forbid
pattern: 'AccountKey=[A-Za-z0-9+/]{86}=='
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Azure storage account key in code, commits, PRs or comments; load it from the environment (AZURE_STORAGE_CONNECTION_STRING).

## Bad
~~~~
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=app;AccountKey=CTOS7oQ6mwUxZXWRxWnMClkmJhZGiJn0dGnpuiYntC1UYaD4GE9dJcIX2GuxsqwjcLaJxyGorPxDAHcsoA5rgv==
~~~~

## Good
~~~~
AZURE_STORAGE_CONNECTION_STRING=${AZURE_STORAGE_CONNECTION_STRING}
~~~~
