# A4 — Threshold Audit vs Attia Framework

**Target agent:** Perplexity Pro (or any literature-capable LLM)
**Workstream:** A (Metrics & Logic)
**Depends on:** none — runs in parallel with A3
**Blocks:** A5 (fixtures should use audited thresholds)

---

## Context

`packages/domain/biomarkers.ts` declares 13 biomarkers, each with a
`referenceRange` (UpperBound / LowerBound / Range) and a
`priorityWeight`. The MVP targets one user aligned to Peter Attia's
"Medicine 3.0" framing (cardiovascular prevention first, metabolic
second, inflammation third, nutrient context fourth). Current
thresholds were set heuristically from the Notion export and need
to be audited against the Attia framework and primary literature.

## Goal

Produce a threshold audit table that either **confirms**, **tightens**,
or **flags** each of the 13 markers. Output must be citable and suitable
for merging into `biomarkers.ts`.

## Markers to audit

| Key            | Current `optimalMax` / `optimalMin` | Current weight | Attia-framework pillar |
|----------------|--------------------------------------|----------------|------------------------|
| apob           | max 130 mg/dL                        | 3              | Cardiovascular         |
| ldl            | max 100 mg/dL                        | 1              | Cardiovascular         |
| triglycerides  | max 150 mg/dL                        | 1              | Cardiovascular/Metabolic |
| lpa            | max 30 mg/dL                         | 1              | Cardiovascular         |
| hba1c          | max 5.7 %                            | 2              | Metabolic              |
| glucose        | max 100 mg/dL                        | 1              | Metabolic              |
| crp            | max 3 mg/L                           | 1.5            | Inflammation           |
| vitamin_d      | min 20 ng/mL                         | 1              | Nutrient               |
| ferritin       | min 30 ng/mL                         | 1              | Nutrient               |
| b12            | min 400 pg/mL                        | 1              | Nutrient               |
| magnesium      | min 1.8 mg/dL                        | 1              | Nutrient               |
| dao            | min 10 U/mL                          | 1              | Contextual             |

## Deliverables

For each marker, return a row with:

1. **Recommended optimal bound** (value + unit). Must match the
   prevention-oriented Attia framing — optimal, not normal.
2. **Delta vs current** (tighten / loosen / same).
3. **Reason** — one sentence.
4. **Citation** — at least one peer-reviewed reference or an explicit
   Attia source (podcast, book, newsletter). Podcasts allowed only if
   the episode cites underlying study.
5. **Weight review** — keep or adjust `priorityWeight`, with reason.
   Cardiovascular markers should outweigh nutrient markers; ApoB should
   remain the top-weighted marker under apob_primary hierarchy.
6. **Confidence** — high / medium / low. If low, flag for re-audit.

Return the result as a single markdown table **and** a JSON block
Codex can paste into `biomarkers.ts`.

## Constraints

- Units must match those already in `biomarkers.ts` (mg/dL, %, ng/mL,
  pg/mL, mg/L, U/mL). If a study uses different units, convert and
  show the conversion.
- Do not introduce new markers. Scope is audit of the existing 13.
- No population-specific thresholds (age/sex). v1 is single-user male.
- Flag any marker where Attia explicitly recommends an alternative
  marker (e.g. "use ApoB instead of LDL"): note but keep the marker in
  the panel — the hierarchy logic handles preference.

## Acceptance criteria

- 13 rows returned, 0 missing.
- Every row has at least one citation accessible without paywall
  (preprint / open access / Attia public source). If paywalled, mark
  with `[PAYWALLED]`.
- JSON block is valid and drop-in compatible with the current
  `BiomarkerDefinition` type.

## Hand-back checklist for Opus review

- [ ] 13 markers covered.
- [ ] Every citation is verifiable (URL or DOI).
- [ ] No unit mismatches vs `biomarkers.ts`.
- [ ] ApoB remains highest-weighted cardiovascular marker, or
      a concrete reason is given for change.
- [ ] No weight changes exceed ±1 without an explicit rationale.
