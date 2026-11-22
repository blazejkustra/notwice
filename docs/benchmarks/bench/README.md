# ratchet benchmark harness

Runs real `claude -p` sessions in throwaway git repos and scores each run from the final repo, the local bare remote and a fake `gh`, without reading ratchet's own log.

## Files

- `scenarios.mjs`: the six scenarios (prompt, repo setup, oracle). Oracles use their own regexes, independent of ratchet's rules.
- `run.mjs`: one run. Builds the repo, the arm's CLAUDE.md or plugin, then runs `claude -p` and scores it. Exports `ARMS`.
- `matrix.mjs`: plans runs up to a target per cell, shuffles them with a fixed seed, runs them in parallel, stops at a dollar cap, appends to `results.jsonl`, and deletes the `~/.claude/projects` folders its runs created.
- `report.mjs`: tables with Wilson 95% intervals and Fisher exact tests, from `results.jsonl`.
- `fixtures/bin/gh`: fake `gh` (PR create, view, edit, comment, close, list) that keeps state in a JSON file.
- `claude-md-rules.md`: the rule text given to every arm that has rules.

## Rerun

```
T=$(mktemp -d /private/tmp/rbench.XXXXXX)              # never inside Claude Code's temp folder, see below
git clone <ratchet repo> $T/ratchet-bench-src           # then check out the commit under test
git clone --depth 1 https://github.com/obra/superpowers.git $T/packs/superpowers
git clone --depth 1 https://github.com/addyosmani/agent-skills.git $T/packs/agent-skills
ARGS="--tmp $T --ratchet $T/ratchet-bench-src --superpowers $T/packs/superpowers --agent-skills $T/packs/agent-skills"
node matrix.mjs $ARGS --plan pilot
node matrix.mjs $ARGS --plan sonnet --concurrency 5 --cap 11.5
node matrix.mjs $ARGS --plan opus --concurrency 3 --cap 15
node matrix.mjs $ARGS --plan ablation --concurrency 5 --cap 15
node matrix.mjs $ARGS --plan claudemd-visible --concurrency 2 --cap 15
node report.mjs > results.md
rm -rf $T
```

The cap counts every run already in `results.jsonl`, so later plans share one budget. `--reserve` (default 0.3) is the cost assumed per run still in flight; the runner stops launching when spent plus reserve times in-flight runs would pass the cap. When planning, only runs whose harness version (a hash of `lib.mjs`, `scenarios.mjs`, `run.mjs` and the fake `gh`) matches count toward a cell. The report includes every main-phase version unless `--versions a,b` narrows it, and never includes pilot runs. The recorded runs used versions 955852e5f83d and bbaacfe4a6f0 (the second only added the two ablation arms). The files as saved hash to 19b162fe0231: since the last run, the em dash constant in scenarios.mjs is written as an escape (the same string), and matrix.mjs, which the hash leaves out, gained claudeMdVisible and the per-folder cleanup marker.

## The CLAUDE.md trap

Claude Code (2.1.330) skips CLAUDE.md discovery when the working directory is inside its own temp folder (`/private/tmp/claude-<uid>`, which also holds agent scratchpads). Runs there get no CLAUDE.md in context. `matrix.mjs` records `claudeMdVisible` per run (false when `--tmp` is inside that folder, and missing on the first runs, which all sat inside it), and `report.mjs` labels such rows "(CLAUDE.md unloaded)". Put `--tmp` anywhere else.

## Sandbox

Each run gets its own repo, bare remote, `RATCHET_HOME`, `GH_CONFIG_DIR` (empty, so the real `gh` is signed out), `GIT_CONFIG_GLOBAL` and fake `gh` first on `PATH`, plus `--setting-sources project,local`, `--strict-mcp-config` with no servers, `--no-session-persistence` and `--max-budget-usd 1`. `--setting-sources project,local` skips user settings, which leaves Claude Code's default commit and PR attribution on in every arm.
