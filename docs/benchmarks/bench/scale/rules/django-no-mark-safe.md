---
kind: forbid
pattern: '\bmark_safe\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Never call mark_safe on user content.

## Bad
~~~~
return mark_safe(comment.body)
~~~~

## Good
~~~~
return format_html("<p>{}</p>", comment.body)
~~~~
