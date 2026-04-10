# MEMORY.md

Project long-term operating memory for **One L1fe (OL)**.

Important: this file stores project memory, not personal health records. Do not place raw user health data, lab reports, or personally identifiable medical information here.

---

## Session Update — 2026-04-10 (~03:00–05:15 CEST)

### Was passiert ist

Diese Session war primär ein **OC-Infrastruktur-Fix**, kein Product-Build. Folgendes wurde erledigt:

1. **ChatGPT-Quota erschöpft** (~96% cached, gpt-5.4 throttled). Root cause: Free-Tier Rate-Limit des OAuth-Accounts `arthaeed24@rungkad.app` (Fremd-Account, nicht Projekt-Account).

2. **OpenRouter als neuer LLM-Provider eingerichtet:**
   - Account erstellt, API-Key generiert
   - Key in OC Dashboard hinterlegt (`OPENROUTER_API_KEY` als Environment Variable)
   - Plugin `openrouter` aktiviert

3. **Modell-Stack konfiguriert (Free-Tier Fallback-Kette):**
   - Primary: `openrouter/xiaomi/mimo-v2-flash:free` (MiMo-V2-Flash — #1 SWE-Bench Coding, 262K ctx)
   - Fallback 1: `openrouter/google/gemma-4-26b-it:free`
   - Fallback 2: `openrouter/nvidia/llama-3.1-nemotron-ultra-253b-v1:free`
   - Fallback 3: `openrouter/minimax/minimax-m1:free`
   - Fallback 4: `openrouter/meta-llama/llama-3.3-70b-instruct:free`
   - Fallback 5: `openrouter/free` (OpenRouter Auto — vollautomatisch, zero maintenance)
   - Alle kostenlos, kein Ablaufdatum, kein monatliches Budget

4. **Security Audit bereinigt:**
   - Sandbox für alle kleinen Modelle aktiviert (`agents.defaults.sandbox.mode=all`)
   - Web-Tools für kleine Modelle deaktiviert
   - Ergebnis: **0 critical · 1 warn** (verbleibender WARN = loopback/kein Reverse Proxy → ignorierbar)

5. **Telegram-Channel eingerichtet:**
   - Bot erstellt via @BotFather
   - Channel in OC konfiguriert und live
   - OC ist jetzt über Telegram erreichbar

6. **GitHub-Account gewechselt:**
   - Perplexity (AI-Assistent) ist jetzt mit `gzug`-Account verknüpft
   - Direkter Repo-Zugriff auf `gzug/One-L1fe` bestätigt

### Offene Tasks aus dieser Session

- [ ] **Ollama-Setup als lokaler Fallback** (gemma4B + qwen3b lokal — Modelle nicht installiert, `ollama list` leer). Für später wenn OC stabil läuft.
- [ ] **Product-Arbeit hat noch nicht begonnen** — Repo-Struktur existiert aber keine neuen Product-Commits diese Session.

### Wichtige Lernregel (neu)

> Immer vollständige, ausführbare Scripts in einem Schritt liefern — nie manuelle Suchen/Ersetzen im Terminal verlangen. User bevorzugt One-Liner die alles erledigen.

---

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

## Current Execution Posture

This is currently a **private-first build phase**.

Meaning:
- speed, clarity, and product learning matter more than formal business packaging,
- compliance and business work stay documented but are not allowed to dominate Phase 0 execution,
- architecture and domain clarity take priority over premature polish.

Guardrail: parked does not mean forgotten. If external users, data sharing, public claims, or broader deployment enter scope, the parked areas must be reactivated.

## Tech Stack Snapshot

| Layer | Choice | Notes |
| --- | --- | --- |
| Mobile App | React Native | Primary app client. |
| Backend | Supabase | Database, auth, storage, and backend services. |
| LLM Layer | OpenRouter (Free-Tier) | MiMo-V2-Flash primary + 5-model fallback chain. OpenAI API as future option. |
| Agent Ops | OpenClaw 4.9 | Local orchestration, LaunchAgent, Telegram channel live. |
| Channel | Telegram Bot | Primary OC interaction channel. |

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

## Architecture Decisions (Current)

- Use a **simple monorepo-style structure** inside the product repo, not an early microservice split.
- Keep the first product client in `apps/mobile`.
- Keep reusable health/domain logic in `packages/domain` instead of scattering it across UI code and database code.
- Keep LLM access **server-side only**, likely behind Supabase functions or equivalent backend endpoints.
- Keep raw biomarker records separate from derived insights and recommendation text.
- Build one credible path first: biomarker capture, storage, trend view, bounded recommendation layer.

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
- OpenClaw version: **2026.4.9**
- Primary Model: **MiMo-V2-Flash via OpenRouter (free)**
- Fallback chain: Gemma 4 26B → Nemotron 253B → MiniMax M1 → Llama 3.3 70B → openrouter/free
- Runtime exposure: **LaunchAgent on 127.0.0.1:18789**
- Channel: **Telegram Bot (live)**
- GitHub: **gzug account**
- Role: local agent operations and development support

Operating assumption: this setup is development-oriented until a hardened production posture is explicitly defined.

## Learnings Imported from the Old Repo / Prior Project

These are working assumptions derived from prior project experience and should be refined when older materials are reviewed directly.

- The agent should build and maintain the repo structure itself so it learns the operating surface by doing, not only by reading context.
- Core documents should exist early: glossary, project memory, operating guide, and intended-use boundary.
- Repo separation matters. Product work and agent-ops work should not collapse into one ambiguous workspace.
- Narrow scope wins early. A smaller biomarker set is more credible and easier to reason about than a broad but weakly defined one.
- The assistant should be direct, verdict-first, and explicit about uncertainty.
- Compliance framing must appear near the top of the project, but it does not need to drive every early implementation decision.
- **Always deliver complete, executable one-liner scripts. Never ask the user to manually search or edit lines in the terminal.**

## Active Risks

- **Compliance drift**: the product language could accidentally slide from wellness support into medical claims.
- **Sensitive-data leakage**: health data could be pasted into commits, tickets, logs, or prompts without proper handling.
- **Evidence quality risk**: recommendations may look confident even when evidence is thin or mixed.
- **Scope creep**: biomarker and feature expansion could outpace compliance and product clarity.
- **Agent overreach**: tooling may attempt actions beyond safe operational boundaries if guardrails are vague.
- **Architecture blur**: unclear boundaries between product repo and ops repo can create confusion and maintenance drag.
- **Vendor dependency**: reliance on external AI APIs adds cost, reliability, and policy exposure.
- **OC config schema instability**: OC 2026.x config validator rejects undocumented keys — always use onboard wizard or dashboard UI for credential setup, never manual JSON edits for auth fields.

## Legal & Compliance Notes

- Health-related user data should be treated as **special-category personal data** under **Art. 9 DSGVO** by default.
- Product posture should remain wellness and self-tracking unless a deliberate legal and regulatory strategy changes that scope.
- Data handling should follow explicit consent, data minimization, purpose limitation, least privilege, and deletion/export readiness.
- Do not store real health data in public repos, public issues, or informal operational notes.
- Every user-facing recommendation should carry evidence, confidence, and scope boundaries.

Note for current phase: this section is intentionally documented and intentionally not driving day-to-day build order yet.

## Immediate Operating Rules

- Read **GLOSSARY.md** and this file at session start before repo-level planning.
- Read **docs/compliance/intended-use.md** before drafting health-adjacent copy or recommendation logic.
- Update this file when core project assumptions, stack choices, risk posture, or repo structure change.
- Deliver terminal commands always as complete, executable scripts — never as manual step-by-step edits.
