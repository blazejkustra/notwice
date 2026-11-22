---
kind: forbid
pattern: '[''"]next/head[''"]'
targets: [files]
paths: ['app/**/*.{ts,tsx}']
severity: block
from: benchmark distractor (framework)
---
In the app directory use the metadata export, not next/head.

## Bad
~~~~
import Head from "next/head"
~~~~

## Good
~~~~
export const metadata = { title: "Pricing" }
~~~~
