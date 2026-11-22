---
kind: forbid
pattern: '^\s*import\s+AddressBook\b'
targets: [files]
paths: ['*.swift']
severity: block
from: benchmark distractor (dependencies)
---
Replace AddressBook with Contacts.

## Bad
~~~~
import AddressBook
~~~~

## Good
~~~~
import Contacts
~~~~
