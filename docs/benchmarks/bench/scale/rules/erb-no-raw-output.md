---
kind: forbid
pattern: '<%==|\braw\s'
targets: [files]
paths: ['*.erb']
severity: block
from: benchmark distractor (security)
---
Do not use <%== or raw in ERB on user content.

## Bad
~~~~
<%== comment.body %>
~~~~

## Good
~~~~
<%= comment.body %>
~~~~
