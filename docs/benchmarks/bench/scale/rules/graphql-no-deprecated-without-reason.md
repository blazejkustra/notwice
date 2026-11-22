---
kind: forbid
pattern: '@deprecated\s*$'
targets: [files]
paths: ['*.{graphql,gql}']
severity: block
from: benchmark distractor (infra)
---
@deprecated needs a reason in GraphQL schemas.

## Bad
~~~~
  legacyId: ID @deprecated
~~~~

## Good
~~~~
  legacyId: ID @deprecated(reason: "Use id")
~~~~
