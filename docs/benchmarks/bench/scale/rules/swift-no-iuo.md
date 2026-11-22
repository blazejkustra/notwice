---
kind: forbid
pattern: '\b(?:var|let)\s+\w+\s*:\s*[A-Z]\w*!\s*(?:$|=)'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Avoid implicitly unwrapped optionals.

## Bad
~~~~
var session: URLSession!
~~~~

## Good
~~~~
var session: URLSession?
~~~~
