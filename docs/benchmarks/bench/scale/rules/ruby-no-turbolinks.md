---
kind: forbid
pattern: '^\s*gem\s+[''"]turbolinks[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on turbolinks; reach for turbo-rails.

## Bad
~~~~
gem 'turbolinks'
~~~~

## Good
~~~~
gem 'turbo-rails'
~~~~
