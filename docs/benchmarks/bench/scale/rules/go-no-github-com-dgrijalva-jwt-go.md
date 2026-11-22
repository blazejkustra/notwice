---
kind: forbid
pattern: '^\s*(?:import\s+)?(?:[\w.]+\s+)?"github\.com\/dgrijalva\/jwt-go(?:/[^"]*)?"'
targets: [files]
paths: ['*.go']
severity: block
from: benchmark distractor (dependencies)
---
github.com/dgrijalva/jwt-go is banned in this codebase. Use github.com/golang-jwt/jwt/v5 instead.

## Bad
~~~~
import "github.com/dgrijalva/jwt-go"
~~~~

## Good
~~~~
"github.com/golang-jwt/jwt/v5"
~~~~
