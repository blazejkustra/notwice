---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-native-vector-icons(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
react-native-vector-icons is banned in this codebase. Use @expo/vector-icons instead.

## Bad
~~~~
import reactNativeVectorIcons from 'react-native-vector-icons'
~~~~

## Good
~~~~
import { Ionicons } from '@expo/vector-icons'
~~~~
