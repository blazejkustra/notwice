---
kind: forbid
pattern: '\bfs\.(?:readFileSync|writeFileSync)\('
targets: [files]
paths: ['**/routes/**', '**/handlers/**', '**/api/**']
severity: block
from: benchmark distractor (language)
---
No synchronous fs calls in request handlers; use fs/promises.

## Bad
~~~~
const html = fs.readFileSync(file)
~~~~

## Good
~~~~
const html = await readFile(file)
~~~~
