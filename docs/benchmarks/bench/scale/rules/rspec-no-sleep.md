---
kind: forbid
pattern: '^\s*sleep\s*\(?\d'
targets: [files]
paths: ['*_spec.rb', 'spec/**/*.rb']
severity: block
from: benchmark distractor (testing)
---
No sleep in specs; use time helpers or waiting matchers.

## Bad
~~~~
sleep 2
~~~~

## Good
~~~~
travel 2.seconds
~~~~
