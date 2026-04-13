# supabase/functions

Server-side functions live here.

Use this area for:
- gated AI calls,
- derived insight generation,
- secure orchestration that should not happen in the mobile client.

Current function paths:
- `save-minimum-slice-interpretation/` for authenticated minimum-slice evaluation and persistence writes into `interpretation_runs`, `interpreted_entries`, and `recommendations`.
