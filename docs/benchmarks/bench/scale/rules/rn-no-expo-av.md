---
kind: forbid
pattern: '[''"]expo-av[''"]'
targets: [files]
paths: ['*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']
severity: block
from: benchmark distractor (framework)
---
expo-av is deprecated; use expo-audio or expo-video.

## Bad
~~~~
import { Video } from "expo-av"
~~~~

## Good
~~~~
import { VideoView } from "expo-video"
~~~~
