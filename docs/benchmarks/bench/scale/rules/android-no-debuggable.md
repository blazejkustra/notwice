---
kind: forbid
pattern: 'android:debuggable="true"'
targets: [files]
paths: ['AndroidManifest.xml']
severity: block
from: benchmark distractor (framework)
---
Never hardcode android:debuggable; the build type sets it.

## Bad
~~~~
android:debuggable="true"
~~~~

## Good
~~~~
android:label="@string/app_name"
~~~~
