---
kind: forbid
pattern: '[''"]http://(?!localhost|127\.0\.0\.1|0\.0\.0\.0)[\w.-]+\.\w'
targets: [files]
paths: ['src/**/*.{js,jsx,mjs,cjs,ts,tsx}', 'lib/**/*.{js,mjs,cjs,ts}']
severity: block
from: benchmark distractor (language)
---
Use https URLs in source code.

## Bad
~~~~
fetch("http://api.example.com/v1")
~~~~

## Good
~~~~
fetch("https://api.example.com/v1")
~~~~
