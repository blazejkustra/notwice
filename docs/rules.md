# Rules

A rule is one Markdown file named `<id>.md`: flat frontmatter, one line of text the agent sees, then `## Bad` and `## Good` examples (fenced blocks recommended). The id is the file name. This one came from a correction about em dashes:

````markdown
---
kind: forbid
pattern: '\u2014'
targets: [files, commits, pr, comments]
severity: block
---
Never use em dashes. Use a comma, colon, parentheses or a full stop.

## Bad
```
(the real line from the incident)
```

## Good
```
(the corrected line)
```
````

| Kind | Checks | Fields |
| --- | --- | --- |
| `forbid` | a regex must not match | `pattern` (one or a list), `unless`, `targets`, `paths` |
| `require` | regexes must all appear, in order (for example PR sections) | `pattern` (list), `targets` (default `pr`) |
| `max-added-lines` | PR size on `gh pr create`, on a push that takes an open PR over the limit, and in CI | `max` (default 300) |
| `max-open-prs` | your open PRs in the repo on `gh pr create` (see [orchestration.md](orchestration.md)) | `max` (default 5) |
| `verify` | a passing check after the last edit to matching files, and a check behind every claim in the reply (see [verify.md](verify.md)) | `when` (globs), `run` (one regex or a list), `claims`, `at: pr`, `needs: test-command` |

Targets: `files` (added lines), `commits` (commit messages, squash merge text), `pr` (PR title and body), `comments` (PR and issue comments, reviews, close reasons, issue text and chat replies) and `commands` (Bash commands the agent is about to run, with message text blanked). Other fields: `severity` (`block` or `warn`), `flags` (regex flags such as `i`), `locked`, `pin: true` (always in the session rule list), `from` (where the rule came from), and `in: main` on forbid rules for files or commands (see [orchestration.md](orchestration.md)). Single-quote regexes in the frontmatter.

- **Escape hatch.** `notwice-allow <rule-id>` on a line, in a command, a PR body or a commit message lets it through and is logged. Block messages tell the agent that only you may add it.
- **Locked rules.** Built-in rules and rules marked `locked: true` (the private key rule in the starter set) ignore `notwice-allow` and the lockfile and generated-file exclusions.
- **Proof.** A rule whose Bad example passes or whose Good example fails cannot be approved. `notwice test` proves every rule.
- **Project rules.** A rule in `<repo>/.notwice/rules/` applies to everyone who works in the repo, and it is the only kind CI checks. To share a personal rule, copy its file from `~/.notwice/rules/` into `<repo>/.notwice/rules/` and commit it. The learn skill offers `<repo>/.notwice/proposed/` when a correction is about one codebase.
- **Locations and precedence.** Built-in rules, then personal rules in `$NOTWICE_HOME/rules` (default `~/.notwice`), then project rules in `<repo>/.notwice/rules`. For the same id the first one wins, so a repo can add rules but cannot replace yours. In CI only project rules apply, read from the PR's base commit, so a PR cannot weaken the rules it is checked against. Protect `.notwice/` and `.github/workflows/` with CODEOWNERS if contributors are untrusted.
- **Lifecycle.** `proposed/` to `rules/` to `retired/`. New rules always land in `proposed/` and wait for you. `approve` and `retire` record a hash of your active rules, and the next session tells you if those files changed outside the CLI.
- **Rule list.** The agent sees a list capped at about 3,700 characters (about 1,500 tokens, measured on Claude Code), since Claude Code replaces hook context over 10,000 characters with a short preview. It fills the list in this order until the cap: built-in and pinned rules, workflow rules (`verify`, `require`, `max-*`, `in: main` and rules on PR text only), rules that fired in the last 30 days (most fires first), the repo's own rules, rules whose `paths` match files in the repo (most files first), then the rest. When rules are left out, its last line says how many more the hooks enforce, and every block message explains the rule it applies. The first time an agent reads or edits a file, it also gets the left-out rules for that file's path.
- **Test command.** A verify rule with `needs: test-command` applies only where notwice finds one, in the manifest nearest the edited file: `package.json` scripts (`test`, then `typecheck`, then `lint`, with the runner its lockfile names), `pyproject.toml` and other Python configs, `Cargo.toml`, `go.mod`, `Package.swift`, Gradle or an Xcode project. Its block message names that command. The starter `tests-after-code` uses it, so a repo without tests never hears from it.
- **Fail open.** An internal error exits 0 and goes to `$NOTWICE_HOME/errors.log`, a broken rule file or a rule that throws is skipped, and a log write that fails never changes a decision. Regexes fall back to a linear engine on excessive backtracking, and lines longer than 10,000 characters are checked up to that length.

## What gets checked, and when

notwice judges only what the current session wrote. At session start it records a snapshot of the repo (HEAD, the working tree including uncommitted and untracked files, and the time). Lines that were already there, lines merged or rebased in from the default branch, renamed files and teammates' commits never block anyone.

| When | What | Outcome |
| --- | --- | --- |
| After Edit or Write (`apply_patch` in Codex) | the lines that tool call introduced | block, with file and line |
| Before a Bash command | each segment of the command: guards on the command itself (rules with `in: main` only in the main session), commit messages, PR titles and bodies, `gh pr comment`, `gh pr review`, `gh pr close --comment`, `gh pr merge --subject/--body`, `gh issue create/edit/comment` | deny |
| Before `git push` and `gh pr create` | commits created this session that the push sends, lines this session committed, and the PR size against the PR's real base | deny |
| Before `gh pr create` | verify rules with `at: pr` (for example a finished review subagent), and your open PRs in the repo against `max-open-prs` | deny |
| Before Edit or Write in the main session (Claude Code) | the lines the edit would add, against `in: main` file rules | deny or warn, before the edit lands |
| At session start, and when a subagent starts | a rule list capped at about 3,700 characters (see Rule list above); subagents get it without `in: main` rules | context |
| Before Read, Edit or Write (`apply_patch` in Codex) | the first touch of a file: the rules whose `paths` match it and that this agent has not been shown, up to about 1,500 characters | context |
| After `git commit`, `gh pr create/edit` | the new commit message; PR text that could not be read before the command ran (through `gh pr view`) | block, ask to amend or edit |
| After Bash and MCP tool calls, and when a subagent finishes | passing runs that a verify rule counts, and finished subagents (`Agent(<type>): <description>`) | recorded as evidence |
| End of each turn (Stop) | lines new since the snapshot and this session's commits | block once per turn, then let the turn end and write a failure record |
| End of each turn (Stop) | verify rules: a passing check after the last matching edit, and claims in the reply | block once per turn, then let the turn end, write a failure record and stop counting that edit |
| End of each turn (Stop) | the chat reply to you | log a failure record, never block |
| Read tool | `*.p8` files | deny |
| Pull request (CI) | the whole PR diff, its commits, title, body and size, against project rules loaded from the base commit | fail the check |


## Starter set

`notwice init` adds five generic rules to `proposed/` and prints one command that approves them all.

| Rule | Kind | Severity |
| --- | --- | --- |
| `no-claude-attribution` | forbid (commits, PR, comments) | block |
| `max-pr-size` | 300 added lines | block |
| `no-private-key` | forbid (files, commits, PR, comments), locked | block |
| `tests-after-code` | verify: tests, typecheck or lint after code changes (npm, pnpm, yarn, bun, tsc, pytest, go, cargo, swift, xcodebuild, gradle) | block |
| `wait-in-background` | forbid (commands), `in: main`: no `gh pr checks --watch` or `gh run watch` in the main session | block |

## Example rules

Opt-in rules in [`examples/rules/`](../examples/rules/). Copy the ones you want into `~/.notwice/proposed/`, then approve them.

| Rule | What it does |
| --- | --- |
| [`no-print-p8`](../examples/rules/no-print-p8.md) | denies commands that print or copy an App Store Connect `.p8` key (locked) |
| [`review-before-pr`](../examples/rules/review-before-pr.md) | `gh pr create` waits for a finished review subagent after the last code edit (see [orchestration.md](orchestration.md)) |
| [`max-open-prs`](../examples/rules/max-open-prs.md) | at most 5 of your open PRs in a repo |
| [`orchestrator-delegates`](../examples/rules/orchestrator-delegates.md) | warns when the main session edits code itself instead of handing it to a subagent |
