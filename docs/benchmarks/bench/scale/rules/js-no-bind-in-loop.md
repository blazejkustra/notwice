---
kind: forbid
pattern: '\.forEach\([^)]*\.bind\(this\)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use arrow functions instead of .bind(this) in callbacks.

## Bad
~~~~
items.forEach(this.render.bind(this))
~~~~

## Good
~~~~
items.forEach((item) => this.render(item))
~~~~
