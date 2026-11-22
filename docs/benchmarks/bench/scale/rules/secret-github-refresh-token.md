---
kind: forbid
pattern: '\bghr_[A-Za-z0-9]{36,76}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a GitHub refresh token anywhere in the repo or on GitHub; pass it through GITHUB_REFRESH_TOKEN.

## Bad
~~~~
GITHUB_REFRESH_TOKEN=ghr_fPyFIS70HuireZRlSnZ6LiSoaTxuOF6ncWCk1O5DBlNW1ALrtbyHosTV67dIWiNtasix6LvPugJq
~~~~

## Good
~~~~
GITHUB_REFRESH_TOKEN=${GITHUB_REFRESH_TOKEN}
~~~~
