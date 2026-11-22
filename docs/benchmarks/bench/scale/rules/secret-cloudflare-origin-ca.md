---
kind: forbid
pattern: '\bv1\.0-[a-f0-9]{24}-[a-f0-9]{146}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Cloudflare origin CA key anywhere in the repo or on GitHub; pass it through CF_ORIGIN_CA_KEY.

## Bad
~~~~
CF_ORIGIN_CA_KEY=v1.0-0d6c43629142f592fa5e3e72-0b7071e21d037dfe07548609d0e9fef1508739cba4c9de91d25542a700b79eb0bed213e687b4842bf1751ad635096e844baa263634f89dbac8990d455688b72ec76adb619c592b14d2
~~~~

## Good
~~~~
CF_ORIGIN_CA_KEY=${CF_ORIGIN_CA_KEY}
~~~~
