---
kind: forbid
pattern: 'bypassSecurityTrust(?:Html|Script|Style|Url|ResourceUrl)\('
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
Never bypass Angular sanitization.

## Bad
~~~~
this.sanitizer.bypassSecurityTrustHtml(html)
~~~~

## Good
~~~~
this.html = sanitize(html)
~~~~
