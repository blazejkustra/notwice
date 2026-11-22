---
kind: forbid
pattern: '^\s*(?:import\s+imghdr(?:\s|\.|,|$)|from\s+imghdr(?:\s|\.))'
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (dependencies)
---
Replace imghdr with filetype or Pillow.

## Bad
~~~~
import imghdr
~~~~

## Good
~~~~
from PIL import Image
~~~~
