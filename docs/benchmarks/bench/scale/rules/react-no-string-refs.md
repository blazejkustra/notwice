---
kind: forbid
pattern: '\bref="\w+"'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
String refs are removed; use useRef or callback refs.

## Bad
~~~~
<input ref="email" />
~~~~

## Good
~~~~
<input ref={emailRef} />
~~~~
