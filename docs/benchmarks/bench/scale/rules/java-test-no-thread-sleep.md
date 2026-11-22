---
kind: forbid
pattern: '\bThread\.sleep\('
targets: [files]
paths: ['*Test.java', '*Tests.java', '*IT.java']
severity: block
from: benchmark distractor (testing)
---
No Thread.sleep in tests; use Awaitility.

## Bad
~~~~
Thread.sleep(500);
~~~~

## Good
~~~~
await().atMost(Duration.ofSeconds(2)).until(job::isDone);
~~~~
