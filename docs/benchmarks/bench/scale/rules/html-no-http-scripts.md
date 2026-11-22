---
kind: forbid
pattern: '<script[^>]+src="http://'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
Load scripts over https.

## Bad
~~~~
<script src="http://cdn.example.com/app.js"></script>
~~~~

## Good
~~~~
<script src="https://cdn.example.com/app.js"></script>
~~~~
