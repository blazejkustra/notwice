---
kind: forbid
pattern: '\brubygems_[a-f0-9]{48}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
A RubyGems API key belongs in the secret manager, never in the repo. Reference GEM_HOST_API_KEY instead.

## Bad
~~~~
GEM_HOST_API_KEY=rubygems_df421293dc2985a99c8abfcb67567edae12e2915fab9535b
~~~~

## Good
~~~~
GEM_HOST_API_KEY=${GEM_HOST_API_KEY}
~~~~
