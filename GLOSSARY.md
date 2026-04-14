# GLOSSARY.md

Project glossary for One L1fe (OL). Keep this file current whenever new recurring abbreviations enter the repo.

| Abbreviation | Full Term | Category | Notes |
| --- | --- | --- | --- |
| OC | OpenClaw | Agent Platform | Local agent runtime and orchestration layer used for operations, automation, and development support. |
| OL | One L1fe | Product | Personal health-tracking product and the primary product repo. |
| PC | Paperclip AI | External Tool | Referenced AI tool or team context. Confirm the exact operational role before integrating it into workflows. |
| GH | GitHub | Platform | Source control, collaboration, and remote hosting. |
| DA | Digital Avatar | Product Concept | Long-term personalized representation built from health data, habits, and biomarker patterns. |
| BM | Biomarker | Health Data | Measurable laboratory or physiological marker used for tracking, correlation, and trend analysis. |
| DSGVO | Datenschutz-Grundverordnung (GDPR) | Compliance | EU data-protection framework, especially relevant for special-category health data under Art. 9. |
| MCP | Model Context Protocol | Architecture | Protocol for connecting models to tools, data sources, and structured context. |
| RAG | Retrieval-Augmented Generation | Architecture | Pattern for grounding model outputs in stored documents, records, or evidence. |
| MVP | Minimum Viable Product | Delivery | Narrowest credible first version that can be tested with real users and real workflows. |
| API | Application Programming Interface | Engineering | Interface used to connect app, backend, and AI services. |
| ApoB | Apolipoprotein B | Biomarker | Core lipid-related biomarker in the MVP set. Primary over LDL. |
| LDL | Low-Density Lipoprotein | Biomarker | Core lipid biomarker. Fallback/secondary to ApoB. |
| Lp(a) | Lipoprotein(a) | Biomarker | Core inherited cardiovascular risk biomarker in the MVP set. Unit-sensitive (nmol/L preferred). |
| HbA1c | Hemoglobin A1c | Biomarker | Core long-range glucose marker for metabolic tracking. |
| CRP | C-reactive Protein | Biomarker | Core inflammation-related biomarker. Prefer hs-CRP assay. |
| DAO | Diamine Oxidase | Biomarker | Contextual biomarker, treated as optional and interpretation-sensitive. Not a core score input. |
| B12 | Vitamin B12 | Biomarker | Supporting biomarker for nutrient status context. |
| HRV | Heart Rate Variability | Wearable Metric | Autonomic recovery signal. Method varies by platform: SDNN (Apple Health) vs RMSSD (Health Connect). Do not compare cross-platform. |
| RLS | Row Level Security | Database | Postgres/Supabase mechanism that enforces per-row ownership via `(select auth.uid())`. All user tables must have RLS enabled. |
| PR | Pull Request | Engineering | GitHub pull request. Used for all code and doc changes to main. |
| EF | Edge Function | Backend | Supabase Edge Function — Deno-based serverless function deployed to the Supabase hosted project. |
| WDS | Wearable Daily Summary | Data Model | App-facing daily aggregate row in `wearable_daily_summaries`. Source-partitioned. |
| PS | Priority Score | Product | Bounded prioritization aid derived from biomarker status. NOT a clinical risk score. |
| CI | Continuous Integration | Engineering | GitHub Actions workflow running typecheck, domain tests, and Supabase lint on each push. |
