---
kind: forbid
pattern: '^\s*gem\s+[''"]protected_attributes[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
Replace protected_attributes with strong parameters.

## Bad
~~~~
gem 'protected_attributes'
~~~~

## Good
~~~~
gem 'rails'
~~~~
