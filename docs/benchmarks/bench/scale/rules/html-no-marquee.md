---
kind: forbid
pattern: '<(?:marquee|blink|center|font)\b'
targets: [files]
paths: ['*.{html,htm}']
severity: block
from: benchmark distractor (language)
---
No obsolete elements (marquee, blink, center, font).

## Bad
~~~~
<center>Welcome</center>
~~~~

## Good
~~~~
<p class="centered">Welcome</p>
~~~~
