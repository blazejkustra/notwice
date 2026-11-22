# notwice

notwice turns your corrections to a coding agent into small rules with a proof, and enforces them on what the agent does (edits, commits, PR text, shell commands) in Claude Code, Codex, git hooks and CI.

- Correct your agent once: it drafts a rule with your real mistake as the Bad example, notwice proves the rule catches it, and only you approve it.
- Hooks check edits, commits, pushes, PR text and shell commands before they land, and the same rule files run as git hooks and in CI for teammates and cloud sessions.
- The agent sees about 1,500 tokens of rules whether you have 10 or 1,000; block messages teach it the rest.

## 30-second example

You correct the agent: "Don't close PRs without saying why. I keep telling you."

In the same turn the agent drafts `~/.notwice/proposed/pr-close-needs-reason.md`, with the command it just ran as the Bad example, and proves it:

```
$ notwice propose pr-close-needs-reason "Closed PR #359 with no reason"
Proposed pr-close-needs-reason: the Bad example triggers it and the Good example passes.
```

You approve it (`!` runs a command in your own shell):

```
! notwice approve pr-close-needs-reason
```

Next time, in any repo, the agent runs `gh pr close 359` and gets this back instead of a closed PR:

```
notwice blocked this command. Fix these first, then run it again:
- command [pr-close-needs-reason] Close a PR only with a reason: gh pr close <n> --comment "<why, and what replaces it>".
    > gh pr close 359
Fix or reword each one, then continue the task in this same turn. Only the user may keep one as it is, by adding "notwice-allow pr-close-needs-reason"; never add that marker yourself.
```

It reruns the command with `--comment "Superseded by #361"` and carries on.

## Install

Claude Code, with Node 20 or newer (no dependencies):

```
/plugin marketplace add blazejkustra/notwice
/plugin install notwice@notwice
```

Then add the starter rules and approve the ones you want:

```
! notwice init
! notwice approve max-pr-size no-claude-attribution no-private-key tests-after-code wait-in-background
```

The plugin puts `notwice` on the PATH of the agent and of `!` commands. For your own terminal, git hooks and Codex, clone the repo and link the CLI into a folder on your PATH:

```
git clone https://github.com/blazejkustra/notwice ~/notwice
mkdir -p ~/.local/bin && ln -s ~/notwice/bin/notwice ~/.local/bin/notwice
```

Use another folder if `~/.local/bin` is missing from your PATH.

To try it for one session without installing anything: `claude --plugin-dir ~/notwice`. To install it for one repo only: `claude plugin install notwice@notwice --scope project`.

**Tip:** turn off Claude Code's own commit and PR attribution, so the agent gets no instruction that fights the starter rule. Add this to `~/.claude/settings.json`:

```json
{ "attribution": { "commit": "", "pr": "" } }
```

With the default left on, the agent tried a Co-Authored-By trailer in 5 of 5 benchmark runs, even with the rule in its context, and notwice had to block each one.

Docs: [rules](docs/rules.md) · [verify rules](docs/verify.md) · [orchestration](docs/orchestration.md) · [Codex](docs/codex.md) · [git hooks and CI](docs/git-hooks-and-ci.md) · [CLI](docs/cli.md) · [agents tracker](docs/agents.md) · [memory inventory](docs/memory.md) · [benchmarks](docs/benchmarks/README.md) · [known gaps](docs/known-gaps.md)

## Where it runs

Every layer reads the same rule files: personal rules in `~/.notwice/rules/` follow you into every repo and agent on your machine, and project rules in `<repo>/.notwice/rules/` apply to everyone who works in the repo.

| Where | What it checks | Limits |
| --- | --- | --- |
| Claude Code | every tool call, subagent and turn end, through plugin hooks | tested on Claude Code 2.1.330 |
| Codex CLI | shell commands, `apply_patch`, subagents and turn end | trust the 8 notwice hooks once in `/hooks`; tested on codex-cli 0.170.0 against a scripted fake model only ([details](docs/codex.md)) |
| git hooks | pre-commit, commit-msg and pre-push, next to husky or lefthook (`notwice install-git-hooks`) | no PR text, comments or shell commands; `--no-verify` skips them |
| CI | the PR diff, commits, title, body and size (`notwice check --ci`) | project rules only, read from the PR's base commit |

On GitHub, the CI check is one step after a full-history checkout ([full workflow](examples/notwice.yml)):

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
- uses: blazejkustra/notwice@v1
```

## Rule kinds

| Kind | Checks | Example |
| --- | --- | --- |
| `forbid` | a regex must not match added lines, commit messages, PR text, comments or shell commands | no Claude trailers; no `gh pr close` without `--comment` |
| `require` | regexes must all appear, in order | the sections of a PR body |
| `max-added-lines` | the size of a PR | at most 300 added lines |
| `max-open-prs` | your open PRs in the repo | at most 5 at once |
| `verify` | a passing check after the last matching edit, and a check behind every "tests pass" in the reply | tests after code changes; a review subagent before `gh pr create` |

Every rule is one Markdown file with a Bad and a Good example. A rule whose Bad example passes or whose Good example fails cannot be approved. Format, fields and the starter set: [docs/rules.md](docs/rules.md).

## Approval

Only you approve rules. The agent writes proposals to `proposed/`, and `notwice approve <id>` moves one into `rules/`. You run it with `!` in Claude Code or in a terminal; either way it skips the agent's hooks. When the agent tries `notwice approve` or `notwice retire` itself, a built-in rule denies it, and a hook denies its writes into `rules/`.

The agent runs as your OS user, so this guard is a speed bump against a determined agent. The next session tells you when active rules changed outside the CLI, and CI reads project rules from the PR's base commit, so a PR cannot weaken the rules it is checked against.

## Why not just CLAUDE.md?

For a few rules on short tasks, a CLAUDE.md that Claude Code loads works as well. In our runs Sonnet 5.5 broke a rule in 0 of 25 sessions with it, 0 of 30 with notwice and 26 of 30 with no rules. Even 1,000 one-line rules fit in CLAUDE.md and were followed. notwice helps in three places:

- **Context stays flat.** 1,000 rules in CLAUDE.md add 34,172 tokens to every request, and a short session cost $0.188. notwice shows the agent about 1,500 tokens of rules at any size, and the same sessions cost $0.044 to $0.063.
- **Rules the agent never saw still hold.** In 70 sessions where the prompt pushed against a rule outside the agent's context, the hooks blocked every attempt and none landed.
- **One rule set everywhere.** A CLAUDE.md reaches the sessions that load it. The same notwice files run in Claude Code, Codex, git hooks and CI, so they also catch commits from teammates and cloud sessions.

## Evidence

| Question | Result | Sample |
| --- | --- | --- |
| Short tasks, 6 rules | no rules: 26 of 30 sessions broke one; CLAUDE.md: 0 of 25; notwice: 0 of 30 | Sonnet 5.5, 6 scenarios, 5 runs each |
| Rules outside the agent's context | 70 of 70 attempts blocked, 0 landed | 60 runs at 12 to 1,000 rules, 10 on the release build |
| 1,000 rules, release build | 0 of 20 violations landed, 15 of 15 attempts blocked, 20 of 20 tasks done | 4 scenarios, 5 runs each |
| Cost at 1,000 rules | CLAUDE.md: +34,172 tokens per request, $0.188 per session; notwice: about 1,500 tokens, $0.044 to $0.063 | 12 CLAUDE.md runs, 20 notwice runs, same 4 scenarios |
| Cost with 6 rules | notwice $0.048 per session against $0.044 for CLAUDE.md, 2.3 s longer | 25 runs each |
| False positives | starter rules: 0 false of 318 fires in 885,892 added lines | 6 repos by other authors |
| Hook cost | 30 to 170 ms of CPU per hook call | release build, 14 and 1,000 rules, 15 runs per hook |

The samples are small (3 to 5 runs per cell), the tasks are short, and the same team built notwice and the harness. Reports, raw runs, intervals and rerun steps: [docs/benchmarks](docs/benchmarks/README.md).

## Known limits

- Rules cover the checkable slice of feedback: 12% of 223 real corrections from one user's month, 36% with verify rules. Design and copy taste stay prose.
- Codex support was tested against a scripted fake model only, and its hooks do nothing until you trust them in `/hooks`.
- The approval guard is a speed bump, since the agent runs as your OS user.
- Long sessions and compaction are untested.
- Rules imported in bulk need a false-positive check against real repos: 17 of 40 sampled fires from a generated 1,000-rule set were false.

More in [docs/known-gaps.md](docs/known-gaps.md).

## Development

`npm test` runs the 167 tests in `test/`. The CLI, hooks and tests use Node's standard library only.

## License

MIT
