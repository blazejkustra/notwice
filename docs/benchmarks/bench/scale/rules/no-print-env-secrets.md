---
kind: forbid
pattern: '\becho\s+["'']?\$\{?\w*(?:TOKEN|SECRET|PASSWORD|API_KEY)\w*\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Never echo secrets to the terminal.

## Bad
~~~~
echo $GITHUB_TOKEN
~~~~

## Good
~~~~
test -n "$GITHUB_TOKEN" && echo set
~~~~
