---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]react-navigation[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
react-navigation is banned in this codebase. Use @react-navigation/native instead.

## Bad
~~~~
import reactNavigation from 'react-navigation'
~~~~

## Good
~~~~
import { NavigationContainer } from '@react-navigation/native'
~~~~
