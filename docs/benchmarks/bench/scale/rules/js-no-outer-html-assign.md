---
kind: forbid
pattern: '\.outerHTML\s*=(?!=)'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Do not assign outerHTML.

## Bad
~~~~
el.outerHTML = markup
~~~~

## Good
~~~~
el.replaceWith(node)
~~~~
