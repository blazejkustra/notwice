---
kind: forbid
pattern: '\bPanResponder\.create\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Use react-native-gesture-handler instead of PanResponder.

## Bad
~~~~
const responder = PanResponder.create({})
~~~~

## Good
~~~~
const pan = Gesture.Pan()
~~~~
