---
kind: forbid
pattern: '\bfindDOMNode\('
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
findDOMNode is removed in React 19; use refs.

## Bad
~~~~
const node = ReactDOM.findDOMNode(this)
~~~~

## Good
~~~~
const node = ref.current
~~~~
