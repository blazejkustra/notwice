---
kind: forbid
pattern: '\b(?:todo|unimplemented)!\('
targets: [files]
paths: ['*.rs']
severity: block
from: benchmark distractor (language)
---
Do not commit todo!() or unimplemented!().

## Bad
~~~~
fn parse(&self) -> Ast { todo!() }
~~~~

## Good
~~~~
fn parse(&self) -> Result<Ast, ParseError> { self.parse_expr() }
~~~~
