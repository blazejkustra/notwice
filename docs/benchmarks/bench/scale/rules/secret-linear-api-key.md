---
kind: forbid
pattern: '\blin_api_[a-zA-Z0-9]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A Linear API key belongs in the secret manager, never in the repo. Reference LINEAR_API_KEY instead.

## Bad
~~~~
LINEAR_API_KEY=lin_api_HIAscxA22IXoCTCWxRS7VYSzZ8uVzHDwolkfSOys
~~~~

## Good
~~~~
LINEAR_API_KEY=${LINEAR_API_KEY}
~~~~
