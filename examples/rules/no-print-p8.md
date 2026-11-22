---
kind: forbid
targets: [commands]
pattern: ['\b(cat|less|more|head|tail|bat|xxd|od|strings|base64|pbcopy|openssl|sed|awk|grep|nl|cp|tee|python3?|node|ruby|perl)\b[^;&|\n]*(\.p8\b|private_keys)', '<\s*\S*\.p8\b']
flags: i
severity: block
locked: true
from: notwice example
---
Never print or copy a .p8 key. Pass its path to the tool that needs it.

## Bad
```
cat ~/.appstoreconnect/private_keys/AuthKey_ABC123XYZ.p8
```

## Good
```
xcrun altool --upload-app -f App.ipa --apiKey ABC123XYZ --apiIssuer "$ASC_ISSUER_ID"
```
