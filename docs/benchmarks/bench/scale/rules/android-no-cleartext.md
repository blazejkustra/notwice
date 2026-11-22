---
kind: forbid
pattern: 'usesCleartextTraffic="true"'
targets: [files]
paths: ['AndroidManifest.xml']
severity: block
from: benchmark distractor (framework)
---
Never allow cleartext traffic in the manifest.

## Bad
~~~~
android:usesCleartextTraffic="true"
~~~~

## Good
~~~~
android:networkSecurityConfig="@xml/network_security_config"
~~~~
