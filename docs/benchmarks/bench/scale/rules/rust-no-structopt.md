---
kind: forbid
pattern: '^\s*(?:pub\s+)?use\s+structopt::|^\s*extern\s+crate\s+structopt\b|^structopt\s*='
targets: [files]
paths: ['*.rs', 'Cargo.toml']
severity: block
from: benchmark distractor (dependencies)
---
Do not import structopt; use clap with derive.

## Bad
~~~~
use structopt::Thing;
~~~~

## Good
~~~~
use clap::Parser;
~~~~
