---
kind: forbid
pattern: '\bsbp_[a-f0-9]{40}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Supabase access token anywhere in the repo or on GitHub; pass it through SUPABASE_ACCESS_TOKEN.

## Bad
~~~~
SUPABASE_ACCESS_TOKEN=sbp_628036ada828dd74ee67335ba25f15c17165078b
~~~~

## Good
~~~~
SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN}
~~~~
