---
kind: forbid
pattern: '@csrf_exempt\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Do not disable CSRF protection on views.

## Bad
~~~~
@csrf_exempt
~~~~

## Good
~~~~
@require_POST
~~~~
