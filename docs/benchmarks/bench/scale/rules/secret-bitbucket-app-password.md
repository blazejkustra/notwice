---
kind: forbid
pattern: '\bATBB[A-Za-z0-9_=.-]{32}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Bitbucket app password anywhere in the repo or on GitHub; pass it through BITBUCKET_APP_PASSWORD.

## Bad
~~~~
BITBUCKET_APP_PASSWORD=ATBB6uw7p2BgWsofTtqEUNppHhKhNcoZgxiE
~~~~

## Good
~~~~
BITBUCKET_APP_PASSWORD=${BITBUCKET_APP_PASSWORD}
~~~~
