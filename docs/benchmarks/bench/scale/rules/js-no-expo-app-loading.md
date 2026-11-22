---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]expo-app-loading(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import expo-app-loading; use expo-splash-screen.

## Bad
~~~~
import expoAppLoading from 'expo-app-loading'
~~~~

## Good
~~~~
import * as SplashScreen from 'expo-splash-screen'
~~~~
