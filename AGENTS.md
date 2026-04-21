---
status: current
canonical_for: agent working rules
owner: repo
last_verified: 2026-04-18
supersedes: []
superseded_by: null
scope: repo
---

# AGENTS.md

Agent operating rules for this repository.

- Agents are allowed to work across the full repository.
- Agents may read, create, edit, move, rename, and delete files.
- Agents may make multi-file changes, refactors, and architectural updates.
- Agents may update docs, code, tests, scripts, CI, and configuration.
- Agents should act autonomously by default.
- Do not pause for approval unless the action is destructive, irreversible, or requires credentials/secrets not already available.
- Prefer brief summaries over long process documentation.
- Be explicit about uncertainty, risks, and assumptions.

## Output standards
- Commit messages: `type(scope): description` — conventional commits
- Never commit: raw health data, secrets, local scratch files
- After any session: update CHECKPOINT.md + CONTEXT.md before closing
- Issues/PRs: close duplicates immediately, do not let them accumulate
