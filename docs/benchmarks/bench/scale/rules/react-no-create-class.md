---
kind: forbid
pattern: '\bcreateReactClass\(|React\.createClass\('
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
createClass is gone; write function components.

## Bad
~~~~
const App = createReactClass({
~~~~

## Good
~~~~
function App() {
~~~~
