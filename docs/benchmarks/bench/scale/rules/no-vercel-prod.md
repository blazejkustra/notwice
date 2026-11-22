---
kind: forbid
pattern: '\bvercel\b[^;&|\n]*\s--prod\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Production deploys go through CI, not vercel --prod.

## Bad
~~~~
vercel --prod
~~~~

## Good
~~~~
vercel
~~~~
