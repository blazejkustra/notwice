---
kind: forbid
pattern: '\.update_(?:attribute|column|columns)\('
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
update_attribute and update_column skip validations; use update.

## Bad
~~~~
user.update_attribute(:admin, true)
~~~~

## Good
~~~~
user.update(admin: true)
~~~~
