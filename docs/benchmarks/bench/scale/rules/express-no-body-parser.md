---
kind: forbid
pattern: 'require\(\s*[''"]body-parser[''"]\s*\)|from\s+[''"]body-parser[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Use express.json() instead of body-parser.

## Bad
~~~~
import bodyParser from "body-parser"
~~~~

## Good
~~~~
app.use(express.json())
~~~~
