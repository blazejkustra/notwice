---
kind: forbid
pattern: '\bxcrun\s+altool\b[^;&|\n]*--upload'
targets: [commands]
severity: block
from: benchmark distractor (commands)
---
Do not upload builds to App Store Connect from a session.

## Bad
~~~~
xcrun altool --upload-app -f App.ipa
~~~~

## Good
~~~~
xcrun altool --validate-app -f App.ipa
~~~~
