---
kind: forbid
pattern: '[?&]sig=[A-Za-z0-9%]{43,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Azure SAS token in code, commits, PRs or comments; load it from the environment (AZURE_SAS_URL).

## Bad
~~~~
AZURE_SAS_URL=https://app.blob.core.windows.net/c?sv=2022-11-02&ss=b&sig=cgm8SIULBxJdWwfNQHKKR5TxD40JM7w0VqPSUkayYnX4Qiu4NBNE
~~~~

## Good
~~~~
AZURE_SAS_URL=${AZURE_SAS_URL}
~~~~
