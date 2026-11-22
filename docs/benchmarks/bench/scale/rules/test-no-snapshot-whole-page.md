---
kind: forbid
pattern: 'render\([^)]*<App\b[^)]*\)\.(?:asFragment|container)\b.*toMatchSnapshot'
targets: [files]
paths: ['*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx}', '**/__tests__/**']
severity: block
from: benchmark distractor (testing)
---
Do not snapshot whole pages; assert on behaviour.

## Bad
~~~~
expect(render(<App />).asFragment()).toMatchSnapshot()
~~~~

## Good
~~~~
expect(screen.getByRole("main")).toHaveTextContent("Welcome")
~~~~
