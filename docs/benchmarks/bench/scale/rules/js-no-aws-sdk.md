---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]aws-sdk[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on aws-sdk; reach for the modular AWS SDK v3 clients.

## Bad
~~~~
import awsSdk from 'aws-sdk'
~~~~

## Good
~~~~
import { S3Client } from '@aws-sdk/client-s3'
~~~~
