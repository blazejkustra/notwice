---
kind: forbid
pattern: '\bexec(?:Sync)?\(\s*\x60'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (security)
---
Do not pass template strings to exec; use execFile with an argument array.

## Bad
~~~~
execSync(`git checkout ${branch}`)
~~~~

## Good
~~~~
execFileSync("git", ["checkout", branch])
~~~~
