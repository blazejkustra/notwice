---
kind: forbid
pattern: '\bshpat_[a-fA-F0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
No Shopify access token in code, commits, PRs or comments; load it from the environment (SHOPIFY_ACCESS_TOKEN).

## Bad
~~~~
SHOPIFY_ACCESS_TOKEN=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
~~~~

## Good
~~~~
SHOPIFY_ACCESS_TOKEN=${SHOPIFY_ACCESS_TOKEN}
~~~~
