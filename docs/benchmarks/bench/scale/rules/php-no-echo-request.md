---
kind: forbid
pattern: 'echo\s+\$_(?:GET|POST|REQUEST|COOKIE)\['
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (security)
---
Never echo request input; escape with htmlspecialchars.

## Bad
~~~~
echo $_GET["q"];
~~~~

## Good
~~~~
echo htmlspecialchars($query, ENT_QUOTES);
~~~~
