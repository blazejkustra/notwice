---
kind: forbid
pattern: '^\s*gem\s+[''"]paperclip[''"]'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (dependencies)
---
Do not import paperclip; use Active Storage.

## Bad
~~~~
gem 'paperclip'
~~~~

## Good
~~~~
gem 'image_processing'
~~~~
