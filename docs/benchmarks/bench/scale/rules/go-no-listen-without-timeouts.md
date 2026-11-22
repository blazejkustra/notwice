---
kind: forbid
pattern: '\bhttp\.ListenAndServe\('
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (language)
---
Use an http.Server with timeouts instead of http.ListenAndServe.

## Bad
~~~~
http.ListenAndServe(":8080", mux)
~~~~

## Good
~~~~
srv := &http.Server{Addr: ":8080", ReadHeaderTimeout: 5 * time.Second}
~~~~
