#!/bin/bash
set -u
T="$1"; NW=${NW:-$(cd "$(dirname "$0")/../../.." && pwd)}
export HOME="$T/userhome" NOTWICE_HOME="$T/home" GIT_CONFIG_GLOBAL="$T/gitconfig" PATH="$NW/test/fixtures/bin:$PATH"
unset T3CODE_THREAD_ID NOTWICE_SESSION CLAUDE_ENV_FILE GIT_EDITOR
mkdir -p "$HOME"; printf '[user]\n\tname = Dev\n\temail = dev@example.com\n[commit]\n\tgpgsign = false\n' > "$GIT_CONFIG_GLOBAL"
nw() { node "$NW/bin/notwice" "$@"; }
nw init >/dev/null; cp "$NW"/test/fixtures/rules/*.md "$NOTWICE_HOME/proposed/"; nw approve $(ls "$NOTWICE_HOME/proposed" | sed 's/\.md$//') >/dev/null
row() { printf '| %s | %s | %s | %s |\n' "$1" "$2" "$3" "$([ "$2" = "$3" ] && echo pass || echo FAIL)"; }
decision() { node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{if(!s)return console.log("allow");const o=JSON.parse(s);console.log(o.hookSpecificOutput?.permissionDecision==="deny"||o.decision==="block"?"deny/block":"allow")})'; }
hookjson() { printf '%s' "$1" | nw hook | decision; }
newrepo() { local d="$T/$1"; rm -rf "$d" "$d.git"; git init -q --bare -b main "$d.git"; git init -q -b main "$d"; cd "$d"; echo hello > README.md; git add -A; git commit -qm init; git remote add origin "$d.git"; git push -q -u origin main; git checkout -q -b feature; }
echo "| Reproduction | Expected | Observed | Result |"; echo "| --- | --- | --- | --- |"
newrepo blocker; mkdir -p .notwice/rules
printf -- "---\nkind: forbid\ntargets: [commands]\npattern: '\\\\S'\nseverity: warn\n---\nC++ style notes.\n" > .notwice/rules/c++-style.md
preBash() { printf '{"session_id":"b1","hook_event_name":"PreToolUse","tool_name":"Bash","cwd":"%s","tool_input":{"command":"%s"}}' "$PWD" "$1"; }
APPROVE=$(preBash 'notwice approve no-utilize' | nw hook | decision); P8=$(preBash 'cat AuthKey_ABC.p8' | nw hook | decision)
row "blocker: c++-style.md project rule, PreToolUse notwice approve no-utilize" deny/block "$APPROVE"
row "blocker: same, PreToolUse cat AuthKey_ABC.p8" deny/block "$P8"
printf -- "---\nkind: forbid\npattern: 'reinterpret_cast'\n---\nNo reinterpret_cast.\n\n## Bad\nint* q = reinterpret_cast<int*>(p);\n\n## Good\nint* q = static_cast<int*>(p);\n" > "$NOTWICE_HOME/proposed/no-c++-casts.md"; nw approve no-c++-casts >/dev/null
hookjson "{\"session_id\":\"b2\",\"hook_event_name\":\"SessionStart\",\"source\":\"startup\",\"cwd\":\"$PWD\"}" >/dev/null
printf 'int* q = reinterpret_cast<int*>(p);\nint r = 1; // a \xe2\x80\x94 b\n' > a.cpp
STOP=$(printf '%s' "{\"session_id\":\"b2\",\"hook_event_name\":\"Stop\",\"cwd\":\"$PWD\",\"stop_hook_active\":false}" | nw hook)
row "blocker: personal no-c++-casts, Stop names both a.cpp lines" "both" "$(echo "$STOP" | grep -q 'a.cpp:1 \[no-c++-casts\]' && echo "$STOP" | grep -q 'a.cpp:2 \[no-em-dash\]' && echo both || echo missing)"
nw install-git-hooks >/dev/null; git add a.cpp; OUT=$(git commit -qm "Add a" 2>&1); CODE=$?
row "blocker: git pre-commit with the same rule (exit, no stack trace)" "1 clean" "$CODE $(echo "$OUT" | grep -q 'at .*check.mjs' && echo trace || echo clean)"
newrepo merge; nw install-git-hooks >/dev/null; echo a > a.md; git add -A; git commit -qm "Add a"; git push -q -u origin feature
git checkout -q main; printf 't \xe2\x80\x94 teammate\n' > t.md; git add -A; git commit -q --no-verify -m "$(printf 'Teammate\n\nCo-Authored-By: Claude <noreply@anthropic.com>')"; git push -q --no-verify origin main; git checkout -q feature
git merge -q --no-edit origin/main; OUT=$(git push -q 2>&1); row "git cor 1: pre-push after merging main into a pushed branch" 0 "$?"
git reset -q --hard origin/feature; git rebase -q origin/main; OUT=$(git push -q --force-with-lease 2>&1); row "git cor 1: pre-push --force-with-lease after rebasing on main" 0 "$?"
newrepo conflict; echo Title > copy.md; git add -A; git commit -qm "Add copy"; git push -q origin feature:main; echo "Feature title" > copy.md; git commit -qam Retitle
git checkout -q -B main origin/main; printf 'Main \xe2\x80\x94 title\n' > copy.md; printf 'other \xe2\x80\x94 main\n' > other.md; git add -A; git commit -qm "Main copy"; git push -q origin main; git checkout -q feature
nw install-git-hooks >/dev/null; git merge -q origin/main >/dev/null 2>&1; git checkout -q --theirs copy.md; git add -A; OUT=$(git commit -q --no-edit 2>&1); row "git cor 5: pre-commit concluding a conflicted merge of main" 0 "$?"
newrepo fork; nw install-git-hooks >/dev/null; git checkout -q -B teammate origin/main; printf 'team \xe2\x80\x94 work\n' > team.md; git add -A; git commit -q --no-verify -m "$(printf 'Team\n\nCo-Authored-By: Claude <noreply@anthropic.com>')"; git push -q --no-verify origin teammate
git checkout -q -b fix --track origin/teammate; echo fix > fix.md; git add -A; git commit -qm "Fix team work"; OUT=$(git push -q origin fix 2>&1); row "git daily 1: push a new branch cut from a teammate branch" 0 "$?"
