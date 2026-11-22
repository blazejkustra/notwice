---
kind: forbid
pattern: '\bshpss_[a-fA-F0-9]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Shopify shared secret anywhere in the repo or on GitHub; pass it through SHOPIFY_SHARED_SECRET.

## Bad
~~~~
SHOPIFY_SHARED_SECRET=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
~~~~

## Good
~~~~
SHOPIFY_SHARED_SECRET=${SHOPIFY_SHARED_SECRET}
~~~~
