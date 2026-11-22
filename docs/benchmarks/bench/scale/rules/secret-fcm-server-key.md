---
kind: forbid
pattern: '\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Firebase Cloud Messaging server key. Read it from FCM_SERVER_KEY at runtime.

## Bad
~~~~
FCM_SERVER_KEY=AAAALxWkDIu:kFvZnm2QVLiC9NlL3av6gVntYvRmnFsJRs9YOMyPSI4Sgg99iIMlBNg6uMpTOEFl4RF3PGgzxtoHE8TD7taRBKOfOESM7S4gYN82CBmLJnfpdQNbnHu7vSNHmIHyacqAz1jTmG0ML12a
~~~~

## Good
~~~~
FCM_SERVER_KEY=${FCM_SERVER_KEY}
~~~~
