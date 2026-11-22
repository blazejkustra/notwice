---
kind: forbid
pattern: '\bimport\s+\w+\s*=\s*require\('
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Do not use import x = require(); use ES imports.

## Bad
~~~~
import fs = require("fs")
~~~~

## Good
~~~~
import fs from "node:fs"
~~~~
