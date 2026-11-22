---
kind: forbid
pattern: '^\s+time\.sleep\('
targets: [files]
paths: ['**/async_*.py', '**/workers/*.py']
severity: block
from: benchmark distractor (language)
---
Use await asyncio.sleep inside async code, not time.sleep.

## Bad
~~~~
    time.sleep(1)
~~~~

## Good
~~~~
    await asyncio.sleep(1)
~~~~
