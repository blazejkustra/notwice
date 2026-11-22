---
kind: forbid
pattern: 'dangerouslySetInnerHTML'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Never use dangerouslySetInnerHTML; render text or sanitize with the shared helper.

## Bad
~~~~
<div dangerouslySetInnerHTML={{ __html: html }} />
~~~~

## Good
~~~~
<div>{text}</div>
~~~~
