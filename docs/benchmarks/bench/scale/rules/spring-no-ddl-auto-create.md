---
kind: forbid
pattern: 'ddl-auto\s*[=:]\s*(?:create|create-drop|update)\b'
targets: [files]
paths: ['application*.properties', 'application*.yml']
severity: block
from: benchmark distractor (framework)
---
Never let Hibernate change the schema; use migrations.

## Bad
~~~~
spring.jpa.hibernate.ddl-auto=update
~~~~

## Good
~~~~
spring.jpa.hibernate.ddl-auto=validate
~~~~
