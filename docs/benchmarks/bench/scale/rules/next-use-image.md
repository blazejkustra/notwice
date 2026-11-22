---
kind: forbid
pattern: '<img\b'
targets: [files]
paths: ['app/**/*.{jsx,tsx}', 'pages/**/*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Use next/image instead of a raw img tag in Next.js pages.

## Bad
~~~~
<img src="/hero.png" alt="" />
~~~~

## Good
~~~~
<Image src="/hero.png" alt="" width={800} height={400} />
~~~~
