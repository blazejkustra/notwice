---
kind: forbid
pattern: '<TouchableOpacity\b'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Use Pressable instead of TouchableOpacity in new code.

## Bad
~~~~
<TouchableOpacity onPress={open}>
~~~~

## Good
~~~~
<Pressable onPress={open}>
~~~~
