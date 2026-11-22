---
kind: forbid
pattern: '^\s*gem\s+[''"]sass-rails[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
Replace sass-rails with cssbundling-rails or dartsass-rails.

## Bad
~~~~
gem 'sass-rails'
~~~~

## Good
~~~~
gem 'dartsass-rails'
~~~~
