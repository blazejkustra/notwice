---
kind: forbid
pattern: '\bclass\s+\w+Impl\b'
targets: [files]
paths: ['*.java']
severity: block
from: benchmark distractor (naming)
---
No Impl suffix; name the implementation for what makes it different.

## Bad
~~~~
class UserServiceImpl implements UserService {
~~~~

## Good
~~~~
class JdbcUserService implements UserService {
~~~~
