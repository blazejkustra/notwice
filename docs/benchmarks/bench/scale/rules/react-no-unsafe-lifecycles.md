---
kind: forbid
pattern: '\bUNSAFE_component\w+'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Do not use UNSAFE_ lifecycle methods.

## Bad
~~~~
UNSAFE_componentWillMount() {
~~~~

## Good
~~~~
componentDidMount() {
~~~~
