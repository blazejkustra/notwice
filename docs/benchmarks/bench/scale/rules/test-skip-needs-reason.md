---
kind: forbid
pattern: '\b(?:it|test|describe)\.skip\(\s*[''"][^''"]*[''"]\s*,'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: warn
from: benchmark distractor (testing)
---
Skipped tests need a ticket in the title: it.skip("ABC-12: ...").

## Bad
~~~~
it.skip("handles retries", () => {
~~~~

## Good
~~~~
it.todo("API-90: handles retries")
~~~~
