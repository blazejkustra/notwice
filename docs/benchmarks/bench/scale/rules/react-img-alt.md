---
kind: forbid
pattern: '<img\b(?![^>]*\balt=)[^>]*>'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Every img needs an alt attribute (empty for decorative images).

## Bad
~~~~
<img src={logo} />
~~~~

## Good
~~~~
<img src={logo} alt="Acme" />
~~~~
