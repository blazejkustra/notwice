---
kind: forbid
pattern: 'DB::raw\(\s*["''][^"'']*\$'
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (framework)
---
Do not interpolate variables into DB::raw.

## Bad
~~~~
DB::raw("count(*) as $alias")
~~~~

## Good
~~~~
DB::raw("count(*) as total")
~~~~
