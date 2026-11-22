---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]xmldom[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Replace xmldom with @xmldom/xmldom.

## Bad
~~~~
import xmldom from 'xmldom'
~~~~

## Good
~~~~
import { DOMParser } from '@xmldom/xmldom'
~~~~
