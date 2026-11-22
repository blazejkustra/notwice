---
kind: forbid
pattern: '(?<![\w-])#[0-9a-fA-F]{3,8}\b(?![\w-])'
targets: [files]
paths: ['src/**/*.{css,scss}', 'app/**/*.{css,scss}']
severity: block
from: benchmark distractor (language)
---
Use color tokens, not raw hex values.

## Bad
~~~~
color: #ff3b30;
~~~~

## Good
~~~~
color: var(--color-danger);
~~~~
