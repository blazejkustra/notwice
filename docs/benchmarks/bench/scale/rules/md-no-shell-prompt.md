---
kind: forbid
pattern: '^\$\s+(?:npm|pnpm|yarn|git|brew|curl)\s'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Do not prefix shell commands with $ in docs (MD014).

## Bad
~~~~
$ npm install
~~~~

## Good
~~~~
npm install
~~~~
