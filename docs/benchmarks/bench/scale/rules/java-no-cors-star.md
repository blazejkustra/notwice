---
kind: forbid
pattern: '@CrossOrigin\(\s*(?:origins\s*=\s*)?"\*"|allowedOrigins\(\s*"\*"'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Never allow every origin in CORS.

## Bad
~~~~
@CrossOrigin("*")
~~~~

## Good
~~~~
@CrossOrigin("https://app.example.com")
~~~~
