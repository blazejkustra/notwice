---
kind: forbid
pattern: '\bNSLog\('
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (language)
---
Use os.Logger instead of NSLog.

## Bad
~~~~
NSLog("Sync failed: %@", error)
~~~~

## Good
~~~~
logger.error("Sync failed: \(error)")
~~~~
