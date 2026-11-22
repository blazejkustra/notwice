---
kind: forbid
pattern: 'android:allowBackup="true"'
targets: [files]
paths: ['AndroidManifest.xml']
severity: block
from: benchmark distractor (framework)
---
Disable allowBackup or define backup rules.

## Bad
~~~~
android:allowBackup="true"
~~~~

## Good
~~~~
android:allowBackup="false"
~~~~
