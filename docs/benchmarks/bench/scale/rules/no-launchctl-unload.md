---
kind: forbid
pattern: '\blaunchctl\s+(?:unload|bootout)\b'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not unload launch agents without asking.

## Bad
~~~~
launchctl unload ~/Library/LaunchAgents/com.app.plist
~~~~

## Good
~~~~
launchctl list | grep com.app
~~~~
