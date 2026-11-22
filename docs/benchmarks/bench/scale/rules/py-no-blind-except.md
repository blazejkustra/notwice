---
kind: forbid
pattern: '^\s*except\s+(?:Base)?Exception\s*:'
targets: [files]
paths: ['*.py']
severity: warn
from: benchmark distractor (language)
---
Do not catch Exception or BaseException without re-raising.

## Bad
~~~~
except Exception:
~~~~

## Good
~~~~
except (ValueError, KeyError):
~~~~
