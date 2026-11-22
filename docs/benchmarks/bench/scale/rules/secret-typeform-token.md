---
kind: forbid
pattern: '\btfp_[A-Za-z0-9_.=-]{59}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Never commit a Typeform token. Read it from TYPEFORM_TOKEN at runtime.

## Bad
~~~~
TYPEFORM_TOKEN=tfp_1krNb6b8YMiDUK7UeTZJ4ELhasDH7ncctdt6oMfU9mrrU5j0UdR7rAu4L9a
~~~~

## Good
~~~~
TYPEFORM_TOKEN=${TYPEFORM_TOKEN}
~~~~
