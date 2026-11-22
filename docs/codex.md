# Codex

notwice runs in Codex CLI through the same plugin, with the same rules home and project rules as Claude Code. It was tested on codex-cli 0.170.0 against a scripted fake model only; no real Codex model run has been made yet.

## Install

Codex installs from a local clone (see the [README](../README.md#install) for the clone and PATH steps):

```
codex plugin marketplace add ~/notwice
codex plugin add notwice@notwice
```

Then open `/hooks` in a Codex session and trust all 8 notwice entries. To confirm they run, send any prompt in a new Codex session, then run `notwice agents` in a terminal: a row labelled `codex` means the hooks ran. No such row means Codex skipped them, so open `/hooks` again.

To ship the hooks with a repo instead, copy [`examples/codex-hooks.json`](../examples/codex-hooks.json) to `<repo>/.codex/hooks.json`. It calls `notwice` from the PATH, and Codex loads project hooks only in trusted projects.

## Differences from Claude Code

- **Approve the hooks once.** Codex runs plugin and project hooks only after you trust them. After installing, open `/hooks` in the Codex TUI (or Review hooks in the desktop app) and trust the 8 notwice entries. Until you do, they do nothing, and `codex exec` skips them without a warning. Codex records trust per hook hash, so an update asks again. `codex exec --dangerously-bypass-hook-trust` skips the review for one run; keep that for sandboxes and CI.
- **Edits** arrive as `apply_patch`. notwice reads the added lines from the patch and finds their line numbers in the file after the edit. The approval guard covers patches that add, update, move or delete files in `rules/`.
- **Verify rules** need each command's exit code, which Codex hooks do not carry. notwice reads it from the Codex session transcript (the `item_completed` record with the same `tool_use_id`, written before the hook runs). That format is undocumented: when the record is missing, the run does not count, which costs one extra block at Stop. A long command that returns before it finishes never counts.
- **`in: main` rules do not apply.** Codex tool hooks do not say whether a subagent made the call, and subagents share the session id, so these rules would also block subagents.
- **Session context** uses the same cap as Claude Code (about 3,700 characters, about 1,500 tokens), well inside the roughly 2,500 tokens of hook output Codex shows the model.
- MCP tool calls count as verify evidence whenever PostToolUse fires; whether Codex fires it for a failed MCP call is untested. The agents tree shows Codex sessions and their subagents, without subagent descriptions.
- Install the plugin or the project hooks, never both: Codex runs every matching hook, so notwice would run twice per call.

## Test

`node eval/codex-e2e.mjs` runs a local fake model server that replays scripted tool calls into the real `codex exec`, with the plugin installed from this repo into a temp `CODEX_HOME` and `HOME`. It needs no login and no model cost, and one round takes about 10 s. Every check reads what Codex sends to the model next. All 5 scenarios pass: a commit with a Claude trailer is denied and never lands (and the rule list and the `notwice:learn` skill reach the model), an `apply_patch` that adds an em dash gets edit feedback, an `apply_patch` into `rules/` is denied, a failing `npm test` does not count and Stop continues the turn until a passing run, and without hook trust the plugin's hooks stay inert.
