---
kind: forbid
pattern: '\bCFPAT-[A-Za-z0-9_-]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Contentful management token. Read it from CONTENTFUL_MANAGEMENT_TOKEN at runtime.

## Bad
~~~~
CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-wV7PLW01JbrXZ45FS6CQPz3Essv8GtV4BURB0U2jeAc
~~~~

## Good
~~~~
CONTENTFUL_MANAGEMENT_TOKEN=${CONTENTFUL_MANAGEMENT_TOKEN}
~~~~
