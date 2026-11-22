---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]framer-motion(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on framer-motion; reach for motion/react.

## Bad
~~~~
import framerMotion from 'framer-motion'
~~~~

## Good
~~~~
import { motion } from 'motion/react'
~~~~
