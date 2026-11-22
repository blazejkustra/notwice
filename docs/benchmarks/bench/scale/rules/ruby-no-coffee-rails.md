---
kind: forbid
pattern: '^\s*gem\s+[''"]coffee-rails[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
Do not import coffee-rails; use plain JavaScript.

## Bad
~~~~
gem 'coffee-rails'
~~~~

## Good
~~~~
gem 'jsbundling-rails'
~~~~
