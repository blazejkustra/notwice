---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]expo-permissions(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import expo-permissions; use the permission hooks of each Expo module.

## Bad
~~~~
import expoPermissions from 'expo-permissions'
~~~~

## Good
~~~~
const [status, request] = Camera.useCameraPermissions()
~~~~
