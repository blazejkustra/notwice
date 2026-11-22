---
kind: forbid
pattern: '(?:\bfrom\s+|\brequire\(\s*|\bimport\(\s*|^\s*import\s+)[''"]moment-timezone(?:/[^''"]*)?[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (dependencies)
---
No new code depends on moment-timezone; reach for Intl.DateTimeFormat or date-fns-tz.

## Bad
~~~~
import momentTimezone from 'moment-timezone'
~~~~

## Good
~~~~
import { formatInTimeZone } from 'date-fns-tz'
~~~~
