---
kind: forbid
pattern: 'Dimensions\.get\(\s*[''"]window[''"]\s*\)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Use useWindowDimensions instead of Dimensions.get("window").

## Bad
~~~~
const { width } = Dimensions.get("window")
~~~~

## Good
~~~~
const { width } = useWindowDimensions()
~~~~
