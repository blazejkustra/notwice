---
kind: forbid
pattern: '[''"]next/router[''"]'
targets: [files]
paths: ['app/**/*.{ts,tsx}']
severity: block
from: benchmark distractor (framework)
---
In the app directory import from next/navigation, not next/router.

## Bad
~~~~
import { useRouter } from "next/router"
~~~~

## Good
~~~~
import { useRouter } from "next/navigation"
~~~~
