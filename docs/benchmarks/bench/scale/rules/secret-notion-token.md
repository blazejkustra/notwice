---
kind: forbid
pattern: '\b(?:secret_[A-Za-z0-9]{43}|ntn_[A-Za-z0-9]{46})\b'
targets: [files, commits, pr, comments]
severity: block
from: benchmark distractor (security)
---
Do not paste a Notion integration token anywhere in the repo or on GitHub; pass it through NOTION_TOKEN.

## Bad
~~~~
NOTION_TOKEN=ntn_RM2GA7j8ylJ1Ii3je9BvUpAFLanXkdz7lwKy5lD7slYuPM
~~~~

## Good
~~~~
NOTION_TOKEN=${NOTION_TOKEN}
~~~~
