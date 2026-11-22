---
kind: forbid
pattern: '\.Provider\s+value=\{\{'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Memoize context values; an object literal re-renders every consumer.

## Bad
~~~~
<Theme.Provider value={{ mode }}>
~~~~

## Good
~~~~
<Theme.Provider value={themeValue}>
~~~~
