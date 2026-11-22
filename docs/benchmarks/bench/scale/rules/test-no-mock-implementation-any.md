---
kind: forbid
pattern: 'as\s+jest\.Mock<any'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Type mocks with the real function signature.

## Bad
~~~~
(api.get as jest.Mock<any>)
~~~~

## Good
~~~~
vi.mocked(api.get)
~~~~
