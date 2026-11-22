---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/jinzhu\/gorm(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
Do not import github.com/jinzhu/gorm; use gorm.io/gorm.

## Bad
~~~~
import "github.com/jinzhu/gorm"
~~~~

## Good
~~~~
"gorm.io/gorm"
~~~~
