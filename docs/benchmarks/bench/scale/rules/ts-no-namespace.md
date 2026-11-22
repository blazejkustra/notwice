---
kind: forbid
pattern: '^\s*(?:export\s+)?namespace\s+\w+'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (naming)
---
Use ES modules instead of TypeScript namespaces.

## Bad
~~~~
namespace Utils {
~~~~

## Good
~~~~
export function format() {}
~~~~
