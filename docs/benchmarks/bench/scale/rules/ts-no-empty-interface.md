---
kind: forbid
pattern: '\binterface\s+\w+\s*\{\s*\}'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
No empty interfaces; use a type alias.

## Bad
~~~~
interface Props {}
~~~~

## Good
~~~~
type Props = Record<string, never>
~~~~
