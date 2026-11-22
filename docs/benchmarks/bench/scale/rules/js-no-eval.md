---
kind: forbid
pattern: '(?<![\w.])eval\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Never call eval; parse the data or use a lookup table.

## Bad
~~~~
const result = eval(expression)
~~~~

## Good
~~~~
const result = evaluate(parse(expression))
~~~~
