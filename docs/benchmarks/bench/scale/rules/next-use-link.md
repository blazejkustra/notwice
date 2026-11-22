---
kind: forbid
pattern: '<a\s+href=["'']/'
targets: [files]
paths: ['app/**/*.{jsx,tsx}', 'pages/**/*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Use next/link for internal links.

## Bad
~~~~
<a href="/pricing">Pricing</a>
~~~~

## Good
~~~~
<Link href="/pricing">Pricing</Link>
~~~~
