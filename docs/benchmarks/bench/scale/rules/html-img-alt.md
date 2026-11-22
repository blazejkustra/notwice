---
kind: forbid
pattern: '<img\b(?![^>]*\balt=)[^>]*>'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
Every img needs an alt attribute.

## Bad
~~~~
<img src="logo.svg">
~~~~

## Good
~~~~
<img src="logo.svg" alt="Acme">
~~~~
