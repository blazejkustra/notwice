---
kind: forbid
pattern: '\.setNativeProps\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
setNativeProps does not work in the new architecture; use state or Reanimated.

## Bad
~~~~
ref.current.setNativeProps({ opacity: 0 })
~~~~

## Good
~~~~
setOpacity(0)
~~~~
