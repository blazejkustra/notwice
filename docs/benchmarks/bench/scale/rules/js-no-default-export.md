---
kind: forbid
pattern: '^\s*export\s+default\s+(?!function\s+\w|class\s+\w)'
targets: [files]
paths: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}', 'lib/**/*.{js,mjs,cjs,ts}']
severity: warn
from: benchmark distractor (language)
---
Prefer named exports; anonymous default exports are hard to search.

## Bad
~~~~
export default () => <Page />
~~~~

## Good
~~~~
export function Page() {}
~~~~
