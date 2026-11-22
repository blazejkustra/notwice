---
kind: forbid
pattern: '\b(?:componentWillMount|componentWillReceiveProps|componentWillUpdate)\b'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Legacy lifecycle methods are banned; use hooks or the safe lifecycles.

## Bad
~~~~
componentWillMount() {
~~~~

## Good
~~~~
useEffect(() => {}, [])
~~~~
