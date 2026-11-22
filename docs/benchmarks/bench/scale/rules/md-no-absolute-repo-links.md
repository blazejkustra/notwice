---
kind: forbid
pattern: '\]\(https://github\.com/[\w-]+/[\w-]+/blob/(?:main|master)/'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Link to files in this repo with relative paths.

## Bad
~~~~
[Guide](https://github.com/acme/app/blob/main/docs/guide.md)
~~~~

## Good
~~~~
[Guide](docs/guide.md)
~~~~
