---
kind: forbid
pattern: '^\s*using\s+System\.Data\.SqlClient\s*;'
targets: [files]
paths: ['*.cs']
severity: block
from: benchmark distractor (dependencies)
---
Replace System.Data.SqlClient with Microsoft.Data.SqlClient.

## Bad
~~~~
using System.Data.SqlClient;
~~~~

## Good
~~~~
using Microsoft.Data.SqlClient;
~~~~
