---
kind: forbid
pattern: '["''][\w.-]+:[\w.-]+:[\d.]*\+["'']'
targets: [files]
paths: ['*.gradle', '*.gradle.kts']
severity: block
from: benchmark distractor (infra)
---
No dynamic versions (1.+) in Gradle dependencies.

## Bad
~~~~
    implementation("com.squareup.okhttp3:okhttp:4.+")
~~~~

## Good
~~~~
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
~~~~
