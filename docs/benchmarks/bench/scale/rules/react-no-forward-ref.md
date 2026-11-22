---
kind: forbid
pattern: '\bforwardRef\('
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
React 19 passes ref as a prop; do not add new forwardRef wrappers.

## Bad
~~~~
const Input = forwardRef((props, ref) => <input ref={ref} />)
~~~~

## Good
~~~~
function Input({ ref, ...props }) { return <input ref={ref} {...props} /> }
~~~~
