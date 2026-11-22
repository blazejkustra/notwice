---
kind: forbid
pattern: '\bWillPopScope\('
targets: [files]
paths: ['*.dart']
severity: block
from: benchmark distractor (language)
---
WillPopScope is deprecated; use PopScope.

## Bad
~~~~
return WillPopScope(onWillPop: confirm, child: page);
~~~~

## Good
~~~~
return PopScope(canPop: false, child: page);
~~~~
