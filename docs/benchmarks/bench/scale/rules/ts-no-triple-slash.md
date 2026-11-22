---
kind: forbid
pattern: '^\s*///\s*<reference\s+path='
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Use imports instead of triple-slash path references.

## Bad
~~~~
/// <reference path="./globals.d.ts" />
~~~~

## Good
~~~~
import "./globals"
~~~~
