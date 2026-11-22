---
kind: forbid
targets: [files]
in: main
pattern: '\S'
paths: ['*.{ts,tsx,js,jsx,mjs,cjs,vue,svelte,py,go,rs,swift,kt,kts,java,rb,php,cs,dart,c,cc,cpp,h,m,mm}']
severity: warn
from: notwice example
---
This session orchestrates: hand code changes to a subagent with a self-contained brief, then review its report.

## Bad
The main session writes the code itself:
```
export function clamp(value: number, min: number, max: number) {
```

## Good
The main session writes no code; a subagent does:
```

```
