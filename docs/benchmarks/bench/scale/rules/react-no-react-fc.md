---
kind: forbid
pattern: ':\s*React\.FC\b|:\s*FC<'
targets: [files]
paths: ['*.{jsx,tsx}']
severity: block
from: benchmark distractor (framework)
---
Type props directly instead of React.FC.

## Bad
~~~~
const Card: React.FC<Props> = ({ title }) => {
~~~~

## Good
~~~~
function Card({ title }: Props) {
~~~~
