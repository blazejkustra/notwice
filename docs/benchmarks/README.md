# Benchmarks

Every number in the notwice README comes from the reports in this folder. All runs used Claude Code 2.1.330 with `claude -p` in throwaway git repos, a local bare remote and a fake `gh`, on 2026-11-22. Most runs used Sonnet 5.5. Samples are small (3 to 5 runs per cell), the tasks are short, and the same team built notwice and the harness, so read the intervals as well as the counts.

notwice was called ratchet while most of these ran. The reports and raw runs keep that name (the `ratchet` arm, `RATCHET_HOME`, `bin/ratchet`). Commit ids in the reports point to the private development history; this repo starts at the release build.

## Reports

| Report | Question | Runs | Raw data |
| --- | --- | --- | --- |
| [benchmarks.md](benchmarks.md) | Six rules on short tasks: no rules, a CLAUDE.md, notwice, two skill packs | 272 runs (Sonnet 5.5, Opus 5.5 on 2 scenarios) | [`bench/results.jsonl`](bench/results.jsonl), tables in [`bench/results.md`](bench/results.md) |
| [benchmarks-scale.md](benchmarks-scale.md) | 12, 150 and 1,000 rules: CLAUDE.md, hooks with no rule list, notwice as shipped | 111 runs and 11 probes | [`bench/scale/`](bench/scale/) |
| [notwice-scale.md](notwice-scale.md) | The capped rule list and fast matching at 1,000 rules | 6 runs and 3 probes (no raw file kept; superseded by the release-build rerun below) | tables in the report |
| [ratchet-verify.md](ratchet-verify.md) | Verify rules: tests after code changes, claims in the reply | 18 runs | [`ratchet-verify-e2e.jsonl`](ratchet-verify-e2e.jsonl) |
| [ratchet-orchestration.md](ratchet-orchestration.md) | `in: main`, the review gate, rules for subagents | 13 runs | [`ratchet-orchestration-e2e.jsonl`](ratchet-orchestration-e2e.jsonl) |
| [final-fixes.md](final-fixes.md) | The release build at 1,000 rules, a CLAUDE.md arm for the orchestration scenarios, a held-out false-positive scan, hook CPU time | 33 runs | [`final-fixes/`](final-fixes/) |

The reports also name a few internal notes (for example `corrections-mining.md`, `ratchet-phase1.md`) that are not included.

## What was scrubbed

Personal data was replaced before publishing: home folder paths (`~`, `<repo>`, `<scratchpad>`, `<personal rules folder>`), session ids (`<session-id>`), the author's private repo names (`repo-a` to `repo-d`, "the monorepo"), the author's name in git authors (`author`) and the name of a private MCP server (`mcp__device__`). Numbers are unchanged: `bench/report.mjs` and `bench/scale/report-scale.mjs` regenerate `results.md` and `results-scale.md` byte for byte from the scrubbed runs.

One file is left out: the 40-line sample of fires from the 1,000-rule false-positive scan (`final-fixes/fp-1000-sample.txt`). Most of its lines quote a private repo's code and its authors. The counts it supports (17 false fires of 40 sampled) are in [final-fixes.md](final-fixes.md).

## Rerun

You need Node 20 or newer and a logged-in `claude`. Put every temp folder outside `/private/tmp/claude-<uid>`: Claude Code skips CLAUDE.md discovery inside its own temp folder, which voided the first CLAUDE.md arm (see [benchmarks.md](benchmarks.md)). Each run creates a `~/.claude/projects/<temp path>` folder; the matrix scripts delete theirs, and you should delete the rest.

### End-to-end scenarios (verify, orchestration, release-build checks)

`eval/e2e.mjs` in this repo runs one scenario in one arm:

```
T=$(mktemp -d /tmp/nw-e2e.XXXXXX)
node eval/e2e.mjs verify-claim plugin "$T/run-1"
```

Arms: `none` (no plugin), `plugin` (this repo with `--plugin-dir`, starter and fixture rules approved), `prose` (the same rules through `--append-system-prompt`) and `claudemd` (the same rules in the repo's CLAUDE.md). Scenarios behind the reports: `verify-code`, `verify-claim`, `verify-docs`, `verify-failing` ([ratchet-verify.md](ratchet-verify.md)), `ci-wait`, `review-pr`, `agents-tree` ([ratchet-orchestration.md](ratchet-orchestration.md)), `attribution` and `learn-implicit` ([final-fixes.md](final-fixes.md)). Each run prints one JSON line and writes `result.json` in its folder. A run costs about $0.05 to $0.13.

### Short tasks and scale (`bench/`)

The harness was written against earlier builds and calls them by their old names. Port a copy to this repo first:

```
T=$(mktemp -d /tmp/nw-bench.XXXXXX)
cp -R docs/benchmarks/bench "$T/bench" && cd "$T/bench"
perl -pi -e "s/RATCHET_HOME/NOTWICE_HOME/g; s/'bin', 'ratchet'/'bin', 'notwice'/g; s/'src', '(rules|check|git|store)\.mjs'/'src', 'core', '\$1.mjs'/g" *.mjs scale/*.mjs
```

Then follow [`bench/README.md`](bench/README.md) (short tasks, about $15 for the full matrix) or [`bench/scale/README.md`](bench/scale/README.md) (scale, about $8), passing `--ratchet <path to this repo>`. Notes for the current build:

- Keep the recorded `bench/scale/rules/` and `rule-sets.json`. `gen-rules.mjs` reproduces them only against the build named in the report, since the starter rules have changed since.
- The hooks-only arm in `matrix-scale.mjs` patches `ruleContext` in `src/hook.mjs`. That code now lives in `sessionContext` in `src/core/context.mjs`, so port the patch or drop the arm. The shipped-plugin and CLAUDE.md arms need only the renames above; [final-fixes.md](final-fixes.md) ran the shipped arm this way.
- `bench/report.mjs` and `bench/scale/report-scale.mjs` rebuild the tables from `results.jsonl` without any model run.

### False positives

- Starter and fixture rules on recent history: `node eval/fp-scan.mjs <commits per repo> <repo...>` ([benchmarks.md](benchmarks.md)).
- Any rule folders: `node docs/benchmarks/final-fixes/fp-scan.mjs <rule dirs, comma-separated> <commits per repo> <author regex to skip, or -> <repo...>` ([final-fixes.md](final-fixes.md)).

### Latency

- Wall clock per hook: `node eval/latency.mjs <repo> [runs]`, with `NOTWICE_HOME` pointing at a rules home. `LATENCY_CPU=1` reports CPU time instead.
- Two builds compared in CPU time: `node docs/benchmarks/final-fixes/latency-paired.mjs <repo> <rules home> <runs> <build dir> <build dir>`.

Measure on an idle machine. The published numbers were taken under load, so only CPU time is reported for the release build.

### Codex

`node eval/codex-e2e.mjs [temp dir]` drives the real `codex exec` against a local fake model server, with temp `HOME` and `CODEX_HOME`. It needs no login and no model cost, and takes about 10 s.

### Replays

`docs/benchmarks/final-fixes/replay.sh <temp dir>` and `docs/benchmarks/final-fixes/dayone.sh <temp dir> <path to this repo>` replay the bug reproductions and first-day steps in [final-fixes.md](final-fixes.md) against the real CLI and git hooks, with temp `HOME`, `NOTWICE_HOME` and `GIT_CONFIG_GLOBAL`.
