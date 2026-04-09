# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

## Project Vision

One L1fe is a **personal health-tracking project** with the long-term ambition of a **Digital Avatar (DA)**.

The product direction is:
- wellness and self-tracking,
- longitudinal pattern detection,
- contextual interpretation support,
- clearer reflection on habits, biomarkers, and trends.

The product is **not** intended to diagnose disease, replace clinicians, prescribe treatment, or act as a medical triage system.

## Current Product Boundary

In scope:
- wellness-oriented self-tracking,
- biomarker organization and visualization,
- pattern detection across time,
- evidence-aware recommendations with explicit uncertainty.

Out of scope:
- diagnosis,
- treatment decisions,
- emergency guidance,
- medical-device claims.

## Tech Stack Snapshot

| Layer | Choice | Notes |
| --- | --- | --- |
| Mobile App | React Native | Primary app client. |
| Backend | Supabase | Database, auth, storage, and backend services. |
| LLM Layer | OpenAI API | Model access for reasoning, summarization, and assistant features. |
| Agent Ops | OpenClaw 4.9 | Local orchestration and agent runtime for development workflows. |

## Two-Repo Split

### One-L1fe
Product repository.
Contains product docs, compliance baseline, domain thinking, app code, schemas, and user-facing implementation artifacts.

### One-L1fe-Ops
Agent workspace and operational repository.
Contains automation, prompts, runbooks, experiments, agent memory, and workflow infrastructure.

Why the split exists:
- keeps product code cleaner,
- reduces accidental mixing of operational artifacts with product artifacts,
- lowers risk of leaking sensitive notes or agent internals into the shipping repo,
- makes the operating surface easier to reason about.

## Biomarker MVP Set

### Core
- ApoB
- LDL
- Triglycerides
- Lp(a)
- HbA1c
- Glucose
- CRP

### Supporting
- Vitamin D
- Ferritin
- B12
- Magnesium

### Contextual
- DAO

Guiding rule: keep the MVP biomarker scope intentionally narrow and defensible before expanding into broader lab panels.

## OC Setup-Stand

Current OpenClaw setup snapshot:
- OpenClaw version: **4.9**
- Model: **gpt-5.4 via OAuth**
- Runtime exposure: **LaunchAgent on 127.0.0.1:18789**
- Role: local agent operations and development support

Operating assumption: this setup is development-oriented until a hardened production posture is explicitly defined.

## Learnings Imported from the Old Repo / Prior Project

These are working assumptions derived from prior project experience and should be refined when older materials are reviewed directly.

- The agent should build and maintain the repo structure itself so it learns the operating surface by doing, not only by reading context.
- Core documents should exist early: glossary, project memory, operating guide, and intended-use boundary.
- Repo separation matters. Product work and agent-ops work should not collapse into one ambiguous workspace.
- Narrow scope wins early. A smaller biomarker set is more credible and easier to reason about than a broad but weakly defined one.
- The assistant should be direct, verdict-first, and explicit about uncertainty.
- Compliance framing must appear near the top of the project, not as a late-stage cleanup task.

## Active Risks

- **Compliance drift**: the product language could accidentally slide from wellness support into medical claims.
- **Sensitive-data leakage**: health data could be pasted into commits, tickets, logs, or prompts without proper handling.
- **Evidence quality risk**: recommendations may look confident even when evidence is thin or mixed.
- **Scope creep**: biomarker and feature expansion could outpace compliance and product clarity.
- **Agent overreach**: tooling may attempt actions beyond safe operational boundaries if guardrails are vague.
- **Architecture blur**: unclear boundaries between product repo and ops repo can create confusion and maintenance drag.
- **Vendor dependency**: reliance on external AI APIs adds cost, reliability, and policy exposure.

## Legal & Compliance Notes

- Health-related user data should be treated as **special-category personal data** under **Art. 9 DSGVO** by default.
- Product posture should remain wellness and self-tracking unless a deliberate legal and regulatory strategy changes that scope.
- Data handling should follow explicit consent, data minimization, purpose limitation, least privilege, and deletion/export readiness.
- Do not store real health data in public repos, public issues, or informal operational notes.
- Every user-facing recommendation should carry evidence, confidence, and scope boundaries.

## Immediate Operating Rules

- Read **GLOSSARY.md** and this file at session start before repo-level planning.
- Read **docs/compliance/intended-use.md** before drafting health-adjacent copy or recommendation logic.
- Update this file when core project assumptions, stack choices, risk posture, or repo structure change.
