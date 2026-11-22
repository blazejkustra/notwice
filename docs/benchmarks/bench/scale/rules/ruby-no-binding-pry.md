---
kind: forbid
pattern: '\bbinding\.(?:pry|irb)\b|^\s*(?:byebug|debugger)\s*$'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (language)
---
Remove binding.pry, byebug and debugger before committing.

## Bad
~~~~
binding.pry
~~~~

## Good
~~~~
Rails.logger.debug(user.inspect)
~~~~
