---
kind: forbid
pattern: 'gem\s+[''"][\w-]+[''"],\s*git:\s*[''"][^''"]+[''"]\s*$'
targets: [files]
paths: ['Gemfile']
severity: block
from: benchmark distractor (infra)
---
Pin git gems to a ref or tag.

## Bad
~~~~
gem 'rails', git: 'https://github.com/rails/rails'
~~~~

## Good
~~~~
gem 'rails', '~> 8.0'
~~~~
