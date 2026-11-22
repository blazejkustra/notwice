---
kind: forbid
pattern: '@Disabled\s*$|@Ignore\s*$'
targets: [files]
paths: ['*Test.java', '*Tests.java', '*IT.java']
severity: block
from: benchmark distractor (language)
---
@Disabled needs a reason.

## Bad
~~~~
@Disabled
~~~~

## Good
~~~~
@Disabled("Flaky on CI, tracked in QA-41")
~~~~
