---
kind: forbid
pattern: '!\[\]\('
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Images need alt text (MD045).

## Bad
~~~~
![](screenshot.png)
~~~~

## Good
~~~~
![Settings screen](screenshot.png)
~~~~
