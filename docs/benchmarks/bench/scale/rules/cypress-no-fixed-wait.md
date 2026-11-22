---
kind: forbid
pattern: '\bcy\.wait\(\s*\d+\s*\)'
targets: [files]
paths: ['e2e/**/*.{js,ts}', 'cypress/**/*.{js,ts}', '*.cy.{js,ts}', '*.e2e.{js,ts}']
severity: block
from: benchmark distractor (testing)
---
No fixed cy.wait(ms); wait on an alias or assertion.

## Bad
~~~~
cy.wait(2000)
~~~~

## Good
~~~~
cy.wait("@getUsers")
~~~~
