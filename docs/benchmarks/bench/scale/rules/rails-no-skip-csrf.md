---
kind: forbid
pattern: 'skip_before_action\s+:verify_authenticity_token'
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Do not skip CSRF verification in controllers.

## Bad
~~~~
skip_before_action :verify_authenticity_token
~~~~

## Good
~~~~
protect_from_forgery with: :exception
~~~~
