---
kind: forbid
pattern: '\bsk\.eyJ[A-Za-z0-9_-]{50,}\.[A-Za-z0-9_-]{20,}'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Mapbox secret token. Read it from MAPBOX_SECRET_TOKEN at runtime.

## Bad
~~~~
MAPBOX_SECRET_TOKEN=sk.eyJzYNtbYlRPkxiZhGtSu41h4pE02HMvP5oYDbVElNuj5xc2BMFlHwC7yBQpJUn.VszYmySDiO84MmyRKqbAbF
~~~~

## Good
~~~~
MAPBOX_SECRET_TOKEN=${MAPBOX_SECRET_TOKEN}
~~~~
