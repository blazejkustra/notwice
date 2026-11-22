---
kind: forbid
pattern: '[''"]react-dom/test-utils[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
react-dom/test-utils is deprecated; use @testing-library/react.

## Bad
~~~~
import { act } from "react-dom/test-utils"
~~~~

## Good
~~~~
import { act } from "@testing-library/react"
~~~~
