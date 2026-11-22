---
kind: forbid
pattern: '(?<![(<\["''])\bhttps?://[^\s)>\]]+(?![^\s]*[)>\]])'
targets: [files]
paths: ['*.{md,mdx}']
severity: block
from: benchmark distractor (docs)
---
Wrap URLs in angle brackets or links (MD034).

## Bad
~~~~
Docs live at https://example.com/docs
~~~~

## Good
~~~~
Docs live at <https://example.com/docs>
~~~~
