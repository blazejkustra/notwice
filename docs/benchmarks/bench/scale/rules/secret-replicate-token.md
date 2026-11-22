---
kind: forbid
pattern: '\br8_[A-Za-z0-9]{37}\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Replicate API token anywhere in the repo or on GitHub; pass it through REPLICATE_API_TOKEN.

## Bad
~~~~
REPLICATE_API_TOKEN=r8_NZCq0XNdIBfw8dr97EOdocpRgYQNVrXajW9fd
~~~~

## Good
~~~~
REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
~~~~
