---
kind: forbid
pattern: '<html(?![^>]*\blang=)[^>]*>'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
The html element needs a lang attribute.

## Bad
~~~~
<html>
~~~~

## Good
~~~~
<html lang="en">
~~~~
