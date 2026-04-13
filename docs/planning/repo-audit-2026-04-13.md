# Repo audit, 2026-04-13

## Verdict

The repo is not a mess. It is structurally good, conceptually strong, and already more disciplined than many early founder repos.

The real weakness is operational trust: the repo has outgrown its original lightweight setup, so GitHub hygiene, backend enforcement, and day-to-day workflow discipline need to catch up.

## 10-point scorecard

### 1. Top-level structure: 8.5/10
Clear separation across app, domain, backend, docs, and scripts.

### 2. Source-of-truth clarity: 8/10
Strong after the new README, CONTRIBUTING, docs guide, and memory updates.
Still needs lived discipline.

### 3. GitHub hygiene: 6.5/10
Now materially improved with templates, CODEOWNERS, CI, and Dependabot.
Still missing GitHub-side enforcement such as branch protection and required checks.

### 4. CI baseline: 7/10
Typecheck and domain tests are in place. Supabase replay validation is now scaffolded.
Still missing secret-backed lint and drift enforcement.

### 5. Backend operational model: 7/10
`supabase/` is now clearly framed as canonical backend history.
Still vulnerable if live changes ever happen ahead of repo changes.

### 6. Documentation quality: 8/10
Docs are strong and thoughtful.
Main risk is not quality, but volume and equal-weight feeling.

### 7. Documentation discipline: 6.5/10
Better navigation now exists, but the repo still has many active docs and little archival pruning so far.

### 8. Branch and merge discipline: 5.5/10
The intended model is now documented, but not yet enforced through GitHub settings.

### 9. AI-assisted development safety: 7.5/10
Good guardrails now exist in writing.
The next challenge is consistently keeping AI-generated breadth smaller and more reviewable.

### 10. Founder-operability: 8/10
The repo is becoming easier for future-you to trust and resume.
Biggest remaining improvement is reducing ambiguity around what to do next and what must never drift.

## Overall score

**7.3/10**

This is a good early-stage repo with real structure. It is not clean enough yet to rely on autopilot, but it is already very fixable and worth tightening now.

## Top 5 problems to address today

### 1. GitHub-side enforcement is still not active
What exists in repo is better, but branch protection and required checks are not yet confirmed live.

### 2. Supabase CI is only partially enforced
Local replay workflow is scaffolded, but lint and drift checks still need secrets and activation.

### 3. Too many docs still compete for attention
The docs layer is better organized now, but still feels heavier than the actual shipped app surface.

### 4. The mobile app layer is still mostly a placeholder
This creates an imbalance where architecture and backend maturity visibly exceed the product shell.

### 5. The repo still depends too much on discipline and memory
The direction is now documented, but a few key protections still depend on manual behavior.

## What should happen today, in order

### A. Finish repo trust foundations
- add GitHub Action secrets
- enable branch protection on `main`
- require CI checks before merge

### B. Tighten Supabase validation
- keep the replay workflow
- add lint once secrets exist
- add drift detection once lint is stable

### C. Reduce doc pressure
- identify 3 to 5 clearly superseded docs and move them to `docs/archive/`
- leave active source-of-truth docs easy to find

### D. Create the next concrete implementation target
- define the thin app-facing client wrapper as the next code seam
- avoid another round of broad architecture expansion first

### E. Keep changes narrowly scoped
- backend hardening
- repo hygiene
- next app/backend seam

Do not mix all three into one giant change wave.

## Recommended order until this evening

1. GitHub settings and secrets
2. Supabase validation path
3. archive low-value or superseded docs
4. define the next implementation seam
5. only then resume product coding

## Anti-patterns to avoid today

- direct live-first backend changes
- broad AI-generated doc expansion
- mixing feature work with operational cleanup
- leaving `main` as both experiment branch and stable branch
- adding more planning layers before the next thin implementation step exists
