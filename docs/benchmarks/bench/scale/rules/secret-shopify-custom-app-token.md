---
kind: forbid
pattern: '\bshpca_[a-fA-F0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Shopify custom app token belongs in the secret manager, never in the repo. Reference SHOPIFY_APP_TOKEN instead.

## Bad
~~~~
SHOPIFY_APP_TOKEN=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
~~~~

## Good
~~~~
SHOPIFY_APP_TOKEN=${SHOPIFY_APP_TOKEN}
~~~~
