---
kind: forbid
pattern: '\bconsole\.(?:log|debug|info|trace)\('
targets: [files]
paths: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}', 'lib/**/*.{js,mjs,cjs,ts}']
severity: block
from: benchmark distractor (language)
---
No console.log in source; use the logger.

## Bad
~~~~
console.log("user", user)
~~~~

## Good
~~~~
logger.debug({ user }, "loaded user")
~~~~
