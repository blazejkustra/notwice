---
kind: forbid
pattern: '\borg\.junit\.Assert\b'
targets: [files]
paths: ['*Test.java', '*Tests.java', '*IT.java']
severity: block
from: benchmark distractor (testing)
---
Use JUnit 5 Assertions or AssertJ, not org.junit.Assert.

## Bad
~~~~
import static org.junit.Assert.assertEquals;
~~~~

## Good
~~~~
import static org.assertj.core.api.Assertions.assertThat;
~~~~
