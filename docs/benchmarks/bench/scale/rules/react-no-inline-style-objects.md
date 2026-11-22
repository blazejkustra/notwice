---
kind: forbid
pattern: 'style=\{\{\s*(?:margin|padding|color|fontSize)\b'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: warn
from: benchmark distractor (framework)
---
Use the design tokens and class names, not inline style objects for spacing or color.

## Bad
~~~~
<p style={{ color: "red" }}>Error</p>
~~~~

## Good
~~~~
<p className="text-danger">Error</p>
~~~~
