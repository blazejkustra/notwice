---
kind: forbid
pattern: '\bdocument\.write(?:ln)?\('
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (language)
---
Never use document.write.

## Bad
~~~~
document.write("<p>Hi</p>")
~~~~

## Good
~~~~
container.append(paragraph)
~~~~
