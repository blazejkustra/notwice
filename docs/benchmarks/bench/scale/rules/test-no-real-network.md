---
kind: forbid
pattern: '\bfetch\(\s*[''"]https?://(?!localhost)'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Unit tests never hit the real network; mock the request.

## Bad
~~~~
const res = await fetch("https://api.example.com/users")
~~~~

## Good
~~~~
server.use(http.get("/users", () => HttpResponse.json([])))
~~~~
