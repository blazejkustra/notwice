---
kind: forbid
pattern: '\bos\.(?:system|popen)\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (security)
---
Use subprocess.run with a list instead of os.system or os.popen.

## Bad
~~~~
os.system("rm -rf build")
~~~~

## Good
~~~~
shutil.rmtree("build")
~~~~
