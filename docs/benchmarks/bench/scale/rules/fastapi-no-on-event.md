---
kind: forbid
pattern: '@app\.on_event\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
on_event is deprecated in FastAPI; use a lifespan handler.

## Bad
~~~~
@app.on_event("startup")
~~~~

## Good
~~~~
app = FastAPI(lifespan=lifespan)
~~~~
