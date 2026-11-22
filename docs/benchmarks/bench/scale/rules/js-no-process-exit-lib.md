---
kind: forbid
pattern: '\bprocess\.exit\('
targets: [files]
paths: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}', 'lib/**/*.{js,mjs,cjs,ts}']
severity: block
from: benchmark distractor (language)
---
Library code never calls process.exit; throw or return an error.

## Bad
~~~~
if (!config) process.exit(1)
~~~~

## Good
~~~~
if (!config) throw new Error("missing config")
~~~~
