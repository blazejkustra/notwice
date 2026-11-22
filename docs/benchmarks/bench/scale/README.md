# Scale benchmark: 12, 150 and 1000 rules

Extends `../` (same scenarios, oracles, fake `gh` and sandbox) to ask whether rules keep working when the rule set grows. Report: `../../benchmarks-scale.md`. Generated tables: `results-scale.md`.

## Files

- `distractors-code.mjs`, `distractors-other.mjs`: distractor rule tables (language, framework, testing, naming, security, secrets, dependencies, commands, writing, Markdown, CI and infrastructure, git and PR text).
- `corpus.mjs`: plausible agent output for the four scenarios. A bulk distractor that fires on any of it is dropped, and the command log of `../results.jsonl` is added to it at run time.
- `gen-rules.mjs`: builds every rule as a ratchet rule file, proves it with the frozen clone's `prove()` (Bad fires, Good passes), drops bulk rules that fire on the corpus, and writes `rules/`, `rule-sets.json` (nested 12, 150 and 1000 sets, seed 20261122) and `gen-report.json`.
- `matrix-scale.mjs`: builds one ratchet home per size (`ratchet approve` of the whole set), `claude-md/<size>.md`, and the hooks-only plugin (a copy of the clone whose SessionStart text is one line); runs `--plan probe`, `--plan pilot` or `--plan main`; appends to `results.jsonl` and `probes.jsonl`; stops at `--cap` dollars counting both files.
- `run-scale.mjs`: one run. Scores the target rules with `../scenarios.mjs` oracles, records ratchet's blocks, and rescans the final repo, commits, PR comments and successful commands with the clone's own checker for every rule of the size (`landed`).
- `report-scale.mjs`: tables with Wilson 95% intervals and Fisher exact tests.
- `latency-stages.mjs`, `latency-loaded.mjs`, `latency/`: hook timing (see the report). `hoist-isignored.patch`: the matching fix tested on a scratch copy.

## Rerun

```
T=$(mktemp -d /private/tmp/rscale.XXXXXX)        # never under /private/tmp/claude-<uid>, Claude Code skips CLAUDE.md there
git clone <repo> $T/src && git -C $T/src checkout 956dd318ac1a797984be8e11e2d6abab1243f6eb
node gen-rules.mjs --ratchet $T/src --tmp $T       # reproduces rules/ and rule-sets.json
ARGS="--tmp $T --ratchet $T/src"
node matrix-scale.mjs $ARGS --plan probe
node matrix-scale.mjs $ARGS --plan pilot --concurrency 3
node matrix-scale.mjs $ARGS --plan main --concurrency 4 --cap 14
node report-scale.mjs > results-scale.md
git clone -q --shared <monorepo> $T/monorepo && git -C $T/monorepo remote remove origin
RATCHET_HOME=<copy of $T/homes/1000> node $T/src/eval/latency.mjs $T/monorepo 30
LATENCY_CPU=1 node latency-loaded.mjs $T/src $T/monorepo $T/homes/1000 15
node latency-stages.mjs $T/src $T/monorepo $T/homes/12 $T/homes/150 $T/homes/1000
rm -rf $T
```

The main runs used harness version `a6ed47d4b83c` (hash of `run-scale.mjs`, `../scenarios.mjs`, `../lib.mjs`, `../fixtures/bin/gh` and `rule-sets.json`). The three pilot runs used `2fbf3f80c577`, before two scanner changes (the `reads` field, and skipping the fixture's pre-existing PR bodies); the report excludes them. Delete any `~/.claude/projects/-private-tmp-rscale-*` folders afterwards: Claude Code writes oversized hook output there even with `--no-session-persistence`.
