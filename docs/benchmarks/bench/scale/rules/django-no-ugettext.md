---
kind: forbid
pattern: '\bugettext(?:_lazy)?\b'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
ugettext is removed; use gettext.

## Bad
~~~~
from django.utils.translation import ugettext as _
~~~~

## Good
~~~~
from django.utils.translation import gettext as _
~~~~
