---
kind: forbid
pattern: 'render\(\)\s*\{[^}]*this\.setState\('
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Never call setState inside render.

## Bad
~~~~
render() { this.setState({ ready: true })
~~~~

## Good
~~~~
componentDidMount() { this.setState({ ready: true }) }
~~~~
