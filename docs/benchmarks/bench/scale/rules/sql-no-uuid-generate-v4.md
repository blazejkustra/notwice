---
kind: forbid
pattern: '\buuid_generate_v4\(\)'
targets: [files]
paths: ['*.sql']
severity: block
from: benchmark distractor (language)
---
Use gen_random_uuid() instead of uuid_generate_v4().

## Bad
~~~~
id UUID DEFAULT uuid_generate_v4(),
~~~~

## Good
~~~~
id UUID DEFAULT gen_random_uuid(),
~~~~
