# V1 Targeted Research Reconciliation (2026-04-12)

## Purpose

This document records what changed after reconciling the targeted second-pass research set with the current V1 planning baseline.

The goal was not to redesign the product from scratch.
The goal was to test whether the current V1 assumptions became:
- stronger,
- unchanged,
- weaker,
- or in need of revision.

## Overall result

The research mostly **strengthened the current direction**.
The main architecture remains correct:
- Notion should not be the hidden logic engine,
- the score should remain a **Priority Score**, not a clinical risk score,
- missing data should remain separate from severity,
- ApoB should remain primary and LDL a fallback or secondary lens,
- weak or contextual markers should stay out of the hard core score.

However, the research did justify several concrete refinements.

## Changes by topic

### 1. ApoB vs LDL

### Result
**Strengthened, not reversed.**

### What changed
- ApoB remains the primary atherogenic signal.
- LDL remains useful, but mainly as:
  - fallback when ApoB is missing,
  - a secondary lens,
  - and a communication bridge to standard lipid care.
- Independent co-scoring of ApoB and LDL is now even less acceptable for V1.

### Why
The targeted research reinforced the discordance argument and the double-counting risk.
That means V1 should stay hierarchical, not additive, in lipid logic.

## 2. Lp(a)

### Result
**Revised to be more bounded.**

### What changed
- Lp(a) is now framed more clearly as a one-time or infrequently repeated inherited risk-enhancing marker.
- Unit strictness is now more explicit.
- The repo now leans away from treating Lp(a) like a hard recurring score driver.
- High Lp(a) should act as a bounded modifier or flag, not as a continuous high-impact score engine.

### Why
The targeted unit-policy research made clear that:
- mg/dL and nmol/L are not safely interchangeable in V1,
- assay and unit ambiguity matter,
- and the main V1 value of Lp(a) is preventive context, not repeated dynamic scoring.

## 3. hs-CRP / CRP

### Result
**Revised to be softer and more assay-dependent.**

### What changed
- hs-CRP is still useful, but now more clearly as a supporting marker.
- Preventive interpretation is allowed only when assay context is clear enough.
- Generic CRP without assay clarity should remain interpretation-limited.
- hs-CRP should not behave like a stable core score axis in the same way as ApoB or HbA1c.

### Why
The research tightened the distinction between:
- low-grade preventive inflammation use,
- acute inflammation context,
- and unclear assay situations.

## 4. Ferritin

### Result
**Weakened as a standalone signal, strengthened as a context-gated marker.**

### What changed
- Ferritin is now better treated as contextual rather than merely supporting.
- Low ferritin can still matter clearly.
- High ferritin should not trigger strong priority logic without context such as inflammation, liver context, or iron transport context.
- Ferritin should not be allowed into the hard core score.

### Why
The new research strongly supported the acute-phase and metabolic-context caveat.
That makes isolated ferritin-high logic too weak for hard scoring.

## 5. Vitamin D

### Result
**Reframed more explicitly.**

### What changed
- V1 now clearly separates:
  - deficiency prevention,
  - adequacy,
  - optional optimization preference,
  - and excess caution.
- Vitamin D remains outside the hard core score.
- The 30-50 ng/mL type zone should be presented as a product-policy target band, not universal consensus.

### Why
The targeted review confirmed strong agreement around deficiency and toxicity edges, but weaker agreement around optimization targets.

## 6. Weekly self-report anchors

### Result
**Strengthened modestly, with no need for expansion.**

### What changed
- Four pillars remain enough for V1.
- Anchor language should stay simple and stable.
- Trend logic should stay explainable and modest.
- Weekly self-report remains a coaching and reflection layer, not a hard biomedical score layer.

### Why
The research mainly reinforced the current anti-drift rationale rather than forcing structural change.

## 7. Priority Score design

### Result
**Strengthened core framing, corrected one dangerous temptation.**

### What changed
- The score remains a bounded prioritization tool.
- Coverage, freshness, and interpretation limits remain outside severity.
- Weekly self-report and contextual markers remain out of the hard core score.
- Lp(a) should be handled cautiously, more as a bounded modifier than a major recurring weighted axis.

### Why
The new design memo strongly supported transparent metadata, honest framing, and conservative score scope.
Some of its broader inclusion ideas were not adopted because they would move V1 too quickly toward a pseudo-clinical composite.

## 8. Safety states and recommendation boundaries

### Result
**Strengthened.**

### What changed
- The recommendation state model is now more clearly supported.
- Recommendation types remain bounded and should be gated by interpretability, scope, and confidence.
- Safety handoff remains a system state, not a diagnosis engine.

### Why
The targeted safety memo aligned well with the existing recommendation contract and made the state gating logic more defensible.

## 9. Source registry and evidence mapping

### Result
**New requirement added to the planning baseline.**

### What changed
- V1 now needs an explicit evidence registry and rule-governance posture.
- Strong, secondary, heuristic, and discard sources should be distinguished.
- Active rules should have anchor sources.

### Why
This was one of the clearest gaps in the previous baseline.
Without it, mixed-quality research can silently become mixed-quality rule logic.

## 10. Notion to backend boundary

### Result
**Strongly strengthened.**

### What changed
- Notion remains useful for review, editorial structure, and light operations.
- Core threshold logic, unit policy, assay gating, scoring logic, and audit-worthy rule behavior should live in domain files and backend systems.

### Why
The migration architecture research strongly reinforced the current direction and made the long-term boundary more explicit.

## Final reconciliation summary

### Stronger than before
- ApoB primary, LDL fallback or secondary lens
- unit and assay strictness
- missing data vs severity separation
- Notion as review layer, not domain-logic core
- recommendation state gating
- need for evidence registry and rule governance

### Revised to be softer or more bounded
- Lp(a) score role
- hs-CRP score role
- ferritin escalation logic
- vitamin D optimization wording

### Effectively unchanged
- four weekly pillars for V1
- weak/contextual markers out of the hard core score
- Priority Score instead of risk score
- bounded wellness-first architecture

## Net conclusion

The current V1 architecture survives the new research well.
It does not need a philosophical reset.

What it needed was a **tightening pass**:
- more explicit evidence governance,
- more caution around contextual markers,
- more unit and assay discipline,
- and cleaner separation between strong rules, policy rules, and heuristics.
