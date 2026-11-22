---
kind: forbid
pattern: 'import\s*\{[^}]*\bAsyncStorage\b[^}]*\}\s*from\s*[''"]react-native[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
AsyncStorage left React Native core; use @react-native-async-storage/async-storage.

## Bad
~~~~
import { AsyncStorage } from "react-native"
~~~~

## Good
~~~~
import AsyncStorage from "@react-native-async-storage/async-storage"
~~~~
