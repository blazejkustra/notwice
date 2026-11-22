# Git hooks and CI

Git hooks and CI run the same rule files without any agent, so they cover your own commits, teammates and cloud sessions.

## Git hooks

`notwice install-git-hooks` adds pre-commit, commit-msg and pre-push hooks to the current repo through git config (`hook.notwice-<event>.command`), so they run alongside husky, lefthook, the pre-commit framework or any `core.hooksPath`, and no file in the repo changes. `--global` installs them for every repo through your global git config. `notwice uninstall-git-hooks` (with the same `--global`) removes them. They need Git 2.54 or later and `node` on the PATH that git sees.

Each hook calls the `notwice` it was installed from. When that file is gone (a deleted clone, a moved link), the hook prints a warning and lets the commit or push through. To remove the hooks by hand, run `git config --remove-section hook.notwice-pre-commit`, then the same for `hook.notwice-commit-msg` and `hook.notwice-pre-push`, with `--global` for a global install.

| Hook | What it checks |
| --- | --- |
| pre-commit | staged added lines against file rules |
| commit-msg | the message against commit rules |
| pre-push | the commits and lines a push sends that the remote does not have yet |

They load the same rules as the agent hooks (built-in, personal and project), so they cover you, teammates and agents without hooks. They never see PR text, comments or shell commands, and `git commit --no-verify` skips them; CI catches what gets past. A blocked commit names the rule and the line, and `notwice-allow <id>` in the line or message keeps it.

A plain `git commit -m "Fix the readme" -m "Co-Authored-By: Claude <noreply@anthropic.com>"` in a repo with the hooks exits 1 with the rule and the line, and the same commit without the trailer goes through.

## CI

On GitHub, commit project rules to `.notwice/rules/`, then add this workflow as `.github/workflows/notwice.yml` (also in [`examples/notwice.yml`](../examples/notwice.yml)):

```yaml
name: notwice
on:
  pull_request:
    types: [opened, edited, synchronize, reopened]
jobs:
  notwice:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: blazejkustra/notwice@v1
```

The action runs `notwice check --ci` against the PR diff, commit messages, title, body and size, annotates violations on the diff and prints a warning for each `notwice-allow`. It needs `fetch-depth: 0`. A rule change takes effect once it merges. To take updates only when you choose, pin a commit SHA in place of `v1`.

In any other CI, run `node <notwice>/bin/notwice check --ci` with the full git history. It reads GitLab merge request variables (`CI_MERGE_REQUEST_DIFF_BASE_SHA`, `CI_MERGE_REQUEST_TITLE`, `CI_MERGE_REQUEST_DESCRIPTION`) by itself. Elsewhere, pass `--base <ref>`, and `--pr-title` and `--pr-body-file` to check the PR text. `--format text|github|json` picks the output (`github` inside GitHub Actions, `text` elsewhere). Project rules always come from the base commit, so a PR cannot weaken its own rules, and personal rules never apply in CI. The exit code is 1 when a blocking rule fails.
