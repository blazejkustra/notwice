---
kind: forbid
pattern: '#\s*(?:TODO|FIXME)\b(?!\([A-Z][A-Z0-9]+-\d+\))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (language)
---
Every Python TODO needs a ticket: TODO(ABC-123).

## Bad
~~~~
# TODO: paginate
~~~~

## Good
~~~~
# TODO(DATA-77): paginate
~~~~
