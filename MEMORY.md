# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

---

## Durable product boundary

- One L1fe is not a diagnostic or treatment system.
- It should be framed as a health data, biomarker, and interpretation product, not as a "wellness" product.
- Recommendations must stay bounded, uncertainty-aware, and within the intended-use boundary.
- Severity, coverage, freshness, and recommendation eligibility must stay distinct.

## Durable architecture posture

- Keep Notion out of hidden runtime logic.
- Keep core health/domain logic in shared domain/backend code.
- Keep ApoB primary and LDL fallback/secondary.
- Keep weak/contextual markers out of the hard core score unless clearly justified.
- Keep the Priority Score framed as a bounded prioritization aid, not a clinical risk score.
- Keep shared domain imports cross-runtime safe when the same files must run under both Node-based tests and Supabase Edge Functions.

## Durable repo operations posture

- `README.md` is the project entry point.
- `CHECKPOINT.md` is the current execution state and next-step source of truth.
- `MEMORY.md` stores only durable assumptions and decisions.
- `main` should stay the stable branch, with short-lived branches for focused changes.
- Keep lightweight GitHub hygiene in place: templates, CODEOWNERS, and CI for typecheck plus domain tests.
- Do not let generated docs or AI-assisted code drift away from the actual implemented path.
- Treat local Supabase replay plus authenticated smoke-test success as the required backend baseline before claiming the edge-function seam works.

## Startup rule

This file stores durable project memory only.
Use `CHECKPOINT.md` for fresh-session startup and current execution state.
Store detailed chronological history under `docs/roadmap/checkpoints/`, not here.

## History archive

Older detailed memory was archived to:
- `docs/roadmap/checkpoints/2026-04-13-pre-compact-memory.md`
