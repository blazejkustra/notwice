---
kind: forbid
pattern: '\brender_template_string\('
targets: [files]
paths: ['*.py']
severity: block
from: benchmark distractor (framework)
---
Do not render templates from strings; use template files.

## Bad
~~~~
return render_template_string(page)
~~~~

## Good
~~~~
return render_template("page.html")
~~~~
