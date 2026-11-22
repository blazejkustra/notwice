---
kind: forbid
pattern: '\bmysql_(?:query|connect|fetch_\w+|real_escape_string)\('
targets: [files]
paths: ['*.php']
severity: block
from: benchmark distractor (language)
---
mysql_* functions are removed; use PDO.

## Bad
~~~~
mysql_query($sql);
~~~~

## Good
~~~~
$stmt = $pdo->prepare($sql);
~~~~
