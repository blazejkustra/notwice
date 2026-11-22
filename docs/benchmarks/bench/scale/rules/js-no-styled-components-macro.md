---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]styled-components\/macro(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
Do not import styled-components/macro; use the styled-components package root.

## Bad
~~~~
import styledComponentsMacro from 'styled-components/macro'
~~~~

## Good
~~~~
import styled from 'styled-components'
~~~~
