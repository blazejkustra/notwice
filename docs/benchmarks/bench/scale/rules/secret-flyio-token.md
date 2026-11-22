---
kind: forbid
pattern: '\bFlyV1 fm[12]_[A-Za-z0-9+/=,_-]{100,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Fly.io token anywhere in the repo or on GitHub; pass it through FLY_API_TOKEN.

## Bad
~~~~
FLY_API_TOKEN=FlyV1 fm2_RIH939wvJHeLqacRVG1q9d6mEbcBdM7L2hirVKpHl7peGEnKenDOHtYo86iWvH30C5DNBZjhIrfnk5hpO60fIVsk7pyCr67HcJm6lqghQgQ3ndQcYeSONbX0
~~~~

## Good
~~~~
FLY_API_TOKEN=${FLY_API_TOKEN}
~~~~
