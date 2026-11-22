---
kind: forbid
pattern: '\boy2[a-z0-9]{43}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a NuGet API key anywhere in the repo or on GitHub; pass it through NUGET_API_KEY.

## Bad
~~~~
NUGET_API_KEY=oy2qvzyqlhn0mb2txolive8bo28qr3wkjvve8g0mpy7ykc
~~~~

## Good
~~~~
NUGET_API_KEY=${NUGET_API_KEY}
~~~~
