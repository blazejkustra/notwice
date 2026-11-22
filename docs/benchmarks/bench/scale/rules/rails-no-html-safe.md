---
kind: forbid
pattern: '\.html_safe\b|(?<![\w.])raw\('
targets: [files]
paths: ['*.rb']
severity: block
from: benchmark distractor (framework)
---
Do not call html_safe or raw on user content.

## Bad
~~~~
comment.body.html_safe
~~~~

## Good
~~~~
sanitize(comment.body)
~~~~
