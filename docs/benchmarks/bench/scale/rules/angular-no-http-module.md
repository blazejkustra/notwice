---
kind: forbid
pattern: '[''"]@angular/http[''"]'
targets: [files]
paths: ['*.{ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
@angular/http is removed; use HttpClient from @angular/common/http.

## Bad
~~~~
import { Http } from "@angular/http"
~~~~

## Good
~~~~
import { HttpClient } from "@angular/common/http"
~~~~
