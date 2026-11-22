---
kind: forbid
pattern: 'Runtime\.getRuntime\(\)\.exec\('
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (security)
---
Use ProcessBuilder with an argument list instead of Runtime.exec.

## Bad
~~~~
Runtime.getRuntime().exec("git pull");
~~~~

## Good
~~~~
new ProcessBuilder("git", "pull").start();
~~~~
