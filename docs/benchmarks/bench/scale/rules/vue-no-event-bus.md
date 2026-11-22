---
kind: forbid
pattern: '\$(?:on|off|once)\(\s*[''"]'
targets: [files]
paths: ['*.vue', 'src/**/*.{js,ts}']
severity: block
from: benchmark distractor (framework)
---
The $on/$off event bus is gone in Vue 3; use a store or mitt.

## Bad
~~~~
bus.$on("saved", reload)
~~~~

## Good
~~~~
emitter.on("saved", reload)
~~~~
