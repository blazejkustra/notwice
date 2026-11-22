---
kind: forbid
pattern: '^\s*(?:puts|p|pp)\s'
targets: [files]
paths: ['lib/**/*.rb', 'app/**/*.rb']
severity: block
from: benchmark distractor (language)
---
No puts or p in library code; use Rails.logger.

## Bad
~~~~
puts "imported #{count}"
~~~~

## Good
~~~~
Rails.logger.info("imported #{count}")
~~~~
