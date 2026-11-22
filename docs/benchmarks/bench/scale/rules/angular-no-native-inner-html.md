---
kind: forbid
pattern: 'nativeElement\.innerHTML\s*='
targets: [files]
paths: ['*.component.ts', '*.service.ts', '*.directive.ts']
severity: block
from: benchmark distractor (framework)
---
Do not write innerHTML through ElementRef; bind in the template.

## Bad
~~~~
this.el.nativeElement.innerHTML = html
~~~~

## Good
~~~~
this.text = html
~~~~
