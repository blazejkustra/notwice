---
kind: forbid
pattern: '\.defaultProps\s*='
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
defaultProps is removed for function components; use default parameters.

## Bad
~~~~
Button.defaultProps = { size: "md" }
~~~~

## Good
~~~~
function Button({ size = "md" }: Props) {}
~~~~
