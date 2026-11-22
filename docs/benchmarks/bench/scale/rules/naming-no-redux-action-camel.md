---
kind: forbid
pattern: 'type:\s*[''"][a-z]+[A-Z]\w*[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Action types use domain/eventName form, for example "cart/itemAdded".

## Bad
~~~~
dispatch({ type: 'addItem' })
~~~~

## Good
~~~~
dispatch({ type: 'cart/itemAdded' })
~~~~
