---
kind: forbid
pattern: 'key=\{\s*(?:index|i|idx)\s*\}'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Do not use the array index as a React key.

## Bad
~~~~
items.map((item, index) => <Row key={index} />)
~~~~

## Good
~~~~
items.map((item) => <Row key={item.id} />)
~~~~
