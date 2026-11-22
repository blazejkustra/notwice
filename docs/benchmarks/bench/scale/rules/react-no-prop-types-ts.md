---
kind: forbid
pattern: '\.propTypes\s*='
targets: [files]
paths: ['*.tsx']
severity: block
from: benchmark distractor (framework)
---
No propTypes in TypeScript components.

## Bad
~~~~
Card.propTypes = { title: PropTypes.string }
~~~~

## Good
~~~~
type Props = { title: string }
~~~~
