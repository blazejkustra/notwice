---
kind: require
pattern: ['^## Problem\s*$', '^## Approach\s*$', '^## Scope\s*$', '^## Tests\s*$', '^## Screenshots\s*$']
targets: [pr]
severity: block
from: ratchet test fixture
---
PR bodies use exactly these sections in order: ## Problem, ## Approach, ## Scope, ## Tests, ## Screenshots.

## Bad
A body written before Scope became required:
````
## Problem
In plan mode every tool asked for permission, even read-only ones,
because the server sent no tool annotations.

## Approach
Tools declare readOnly and the server maps it to readOnlyHint.

## Tests
- Unit tests for the mapping

## Screenshots
````

## Good
````
## Problem
In plan mode every tool asked for permission, even read-only ones,
because the server sent no tool annotations.

## Approach
Tools declare readOnly and the server maps it to readOnlyHint.

## Scope
In:
- readOnlyHint for observe-only tools
Out:
- destructiveHint

## Tests
- Unit tests for the mapping

## Screenshots
````
