---
kind: forbid
pattern: 'useEffect\(\s*async\b'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Effects cannot be async; define an async function inside and call it.

## Bad
~~~~
useEffect(async () => {
~~~~

## Good
~~~~
useEffect(() => { void load() }, [])
~~~~
