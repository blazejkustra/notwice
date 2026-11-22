---
kind: forbid
pattern: 'ADD\s+COLUMN\s+\w+\s+\w+(?:\(\d+\))?\s+NOT\s+NULL(?!\s+DEFAULT)'
flags: i
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Adding a NOT NULL column needs a DEFAULT or a backfill step.

## Bad
~~~~
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL;
~~~~

## Good
~~~~
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
~~~~
