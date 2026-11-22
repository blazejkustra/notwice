---
kind: forbid
pattern: 'from\s+django\.conf\.urls\s+import\s+url\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
django.conf.urls.url is removed; use path or re_path.

## Bad
~~~~
from django.conf.urls import url
~~~~

## Good
~~~~
from django.urls import path
~~~~
