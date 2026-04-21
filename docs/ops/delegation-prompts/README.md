# Delegation Prompts

Ready-to-use prompts for delegating discrete work packages to external agents
(ChatGPT Codex, Perplexity Pro, Claude Haiku 4.5, etc.). The human operator
(Don) pastes the relevant prompt into the target tool. Opus (this agent) stays
in the orchestrator / gatekeeper role — reviewing returned output before merge.

## Scope and status (v1)

Single target user: brother. Device stack confirmed:
- **Watch:** Garmin Forerunner 255.
- **Phone:** OnePlus 13R (OxygenOS 15, Android 15).

Data path: Garmin Forerunner 255 → Garmin Connect app → Health Connect
→ One L1fe app. Priority for v1: sideloadable APK + evidence-anchored
Priority Score + working Health Connect ingest on OxygenOS 15.

Deferred post-v1: Terra webhook bridge, direct Garmin OAuth, iOS HealthKit.

## Routing table

| Prompt | Workstream                                  | Suggested tool    | Why                                                    |
|--------|---------------------------------------------|-------------------|--------------------------------------------------------|
| A3     | Scoring design 2.5 — implementation spec    | Codex             | Close-read of domain layer, TS-heavy                   |
| A4     | Threshold audit vs Attia framework          | Perplexity Pro    | Literature lookup + citations                          |
| A5     | Scoring test matrix                         | Haiku 4.5         | Mechanical fixtures, cheap                             |
| A6     | UI surface — bucket + raw score display     | Codex             | React Native screen edits                              |
| A7     | Trend skeleton — read-only, score-decoupled | Codex             | New domain module + persistence plan                   |
| A8     | User-configurable panel (mandatory/optional/wearable) | Codex    | Migrations + domain + settings UI + score-lock state   |
| B1     | Expo prebuild + EAS config (Mac Mini M4)    | Codex             | Local toolchain, needs repo-aware edits                |
| B2     | Health Connect native wiring + OxygenOS verify | Codex + Perplexity| MainActivity/Manifest + OnePlus background policy      |
| B3     | Sideload runbook for OnePlus 13R            | Haiku 4.5         | Checklist writing, operational                         |
| C2     | Evidence runtime wire (issue #88)           | Codex             | Domain + Edge Function + migration                     |

## Rules for the human operator

1. Paste the prompt **verbatim**. Do not add "please" or "can you" framing —
   the prompts are already calibrated.
2. If the external agent needs repo access, grant read + branch-push only.
   Never give merge rights to an external agent.
3. Every returned output lands on a feature branch, never `main`. PR title
   must match the prompt ID (e.g. `feat(domain): A3 scoring design 2.5`).
4. Opus reviews every PR before merge. Red CI blocks merge.
5. If the agent pushes back on a requirement, capture the objection in the
   PR description and re-route to Opus before accepting the change.

## Rules for the delegated agent (embedded in each prompt)

- Output: minimal, precise, no filler.
- Language: English in repo, commit messages in conventional-commits form.
- Do not implement outside the declared scope. If scope needs expansion,
  stop and flag in PR description.
- Every new public function ships with a test. Every new migration ships
  with a down-migration (or an explicit "irreversible" note).
- No secrets in commits. No `.env` edits. No production Supabase writes
  unless the prompt says so explicitly.

## File naming convention

`{workstream}{index}-{short-slug}.md`, e.g. `A3-scoring-design-25.md`.
Each prompt file is self-contained: context, goal, constraints, deliverables,
acceptance criteria, and a "hand-back checklist" for Opus review.
