---
kind: forbid
pattern: '\bhas_and_belongs_to_many\b'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Use has_many :through instead of has_and_belongs_to_many.

## Bad
~~~~
has_and_belongs_to_many :tags
~~~~

## Good
~~~~
has_many :tags, through: :taggings
~~~~
