#!/bin/bash
set -u
T="$1"; NW="$2"
export HOME="$T/userhome" NOTWICE_HOME="$T/home" GIT_CONFIG_GLOBAL="$T/gitconfig"
unset T3CODE_THREAD_ID NOTWICE_SESSION CLAUDE_ENV_FILE GIT_EDITOR
mkdir -p "$HOME" "$T/bin"; printf '[user]\n\tname = Dev\n\temail = dev@example.com\n' > "$GIT_CONFIG_GLOBAL"
ln -sf "$NW/bin/notwice" "$T/bin/notwice"; nw() { "$T/bin/notwice" "$@"; }
nw init >/dev/null; nw approve $(ls "$NOTWICE_HOME/proposed" | sed 's/\.md$//') >/dev/null
row() { printf '| %s | %s |\n' "$1" "$2"; }
rm -rf "$T/repo"; git init -q -b main "$T/repo"; cd "$T/repo"; echo hi > README.md; git add -A; git commit -qm init
ev() { printf '{"session_id":"d1","hook_event_name":"%s","cwd":"%s"%s}' "$1" "$PWD" "$2"; }
ev SessionStart ',"source":"startup"' | nw hook >/dev/null
mkdir -p src; echo 'export const a = 1' > src/app.js
ev PostToolUse ",\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$PWD/src/app.js\",\"content\":\"export const a = 1\"},\"tool_response\":{\"type\":\"create\",\"structuredPatch\":[]}}" | nw hook >/dev/null
STOP=$(ev Stop ',"stop_hook_active":false' | nw hook)
row "repo with no manifest: Stop after a code edit" "$([ -z "$STOP" ] && echo 'no block' || echo "block: $(echo "$STOP" | head -c 160)")"
echo '{"scripts":{"test":"vitest"}}' > package.json; touch pnpm-lock.yaml; git add -A; git commit -qm pkg
ev SessionStart ',"source":"startup"' | sed 's/d1/d2/' | nw hook >/dev/null; echo 'export const b = 2' > src/b.js
STOP=$(ev Stop ',"stop_hook_active":false' | sed 's/d1/d2/' | nw hook)
row "repo with package.json and pnpm-lock.yaml: Stop hint" "$(echo "$STOP" | grep -o 'for example: [^.]*\.' | head -1); ends with escape: $(echo "$STOP" | grep -q 'If it cannot pass, tell the user\.' && echo yes || echo no)"
nw install-git-hooks >/dev/null; mv "$T/bin/notwice" "$T/bin/notwice.moved"; echo c > c.md; git add -A; OUT=$(git commit -qm "Add c" 2>&1); CODE=$?
row "moved binary: git commit" "exit $CODE: $(echo "$OUT" | head -1 | cut -c1-150)"
mv "$T/bin/notwice.moved" "$T/bin/notwice"; nw uninstall-git-hooks >/dev/null
for args in "install-git-hooks --global --help" "init --help" "approve --help" "--help"; do OUT=$(nw $args 2>&1); CODE=$?; row "notwice $args" "exit $CODE, $(echo "$OUT" | head -1 | cut -c1-60)"; done
row "global git config after the --help calls" "$(grep -c notwice "$GIT_CONFIG_GLOBAL") notwice lines"
