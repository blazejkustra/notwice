---
kind: forbid
pattern: '^\s*gem\s+[''"]therubyracer[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
Replace therubyracer with mini_racer or no JS runtime.

## Bad
~~~~
gem 'therubyracer'
~~~~

## Good
~~~~
gem 'jsbundling-rails'
~~~~
