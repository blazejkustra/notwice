---
kind: forbid
pattern: '\bTIMESTAMP(?!\s*WITH\s+TIME\s+ZONE|TZ)\b(?!\s*\()'
flags: i
targets: [files]
paths: ['**/migrations/**/*.sql', 'db/**/*.sql']
severity: block
from: benchmark distractor (language)
---
Use timestamptz, not timestamp without time zone.

## Bad
~~~~
created_at TIMESTAMP NOT NULL,
~~~~

## Good
~~~~
created_at TIMESTAMPTZ NOT NULL,
~~~~
