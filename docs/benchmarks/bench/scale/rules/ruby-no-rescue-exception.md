---
kind: forbid
pattern: 'rescue\s+Exception\b'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (language)
---
Never rescue Exception; rescue StandardError or something narrower.

## Bad
~~~~
rescue Exception => e
~~~~

## Good
~~~~
rescue ActiveRecord::RecordInvalid => e
~~~~
