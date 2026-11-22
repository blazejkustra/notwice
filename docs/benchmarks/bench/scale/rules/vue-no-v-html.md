---
kind: forbid
pattern: '\bv-html='
targets: [files]
paths: ['*.vue']
severity: block
from: benchmark distractor (framework)
---
Do not use v-html; render text or sanitize first.

## Bad
~~~~
<div v-html="comment.body" />
~~~~

## Good
~~~~
<div>{{ comment.body }}</div>
~~~~
