---
kind: forbid
pattern: '^~~~'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Use backtick fences, not tildes (MD048).

## Bad
~~~~
~~~js
~~~~

## Good
~~~~
```js
~~~~
