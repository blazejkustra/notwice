---
kind: forbid
pattern: '^Change-Id:\s*I[0-9a-f]{40}'
targets: [commits]
severity: block
from: benchmark distractor (git)
---
This repo does not use Gerrit; drop Change-Id trailers.

## Bad
~~~~
Change-Id: I8473b95934b5732ac55d26311a706c9c2bde9940
~~~~

## Good
~~~~
Refs: API-12
~~~~
