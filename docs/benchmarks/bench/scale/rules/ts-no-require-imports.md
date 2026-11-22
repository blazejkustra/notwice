---
kind: forbid
pattern: '=\s*require\(\s*[''"]'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use import statements in TypeScript, never require().

## Bad
~~~~
const path = require("path")
~~~~

## Good
~~~~
import path from "node:path"
~~~~
