---
kind: forbid
pattern: '^\s*(?:const|let|var)\s+[\w{}\s,]+=\s*require\('
targets: [files]
paths: ['*.mjs']
severity: block
from: benchmark distractor (language)
---
This codebase is ESM: use import, not require.

## Bad
~~~~
const fs = require("fs")
~~~~

## Good
~~~~
import fs from "node:fs"
~~~~
