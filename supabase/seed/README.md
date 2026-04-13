# supabase/seed

Local development seed helpers live here.

Current reset path:
- `supabase/config.toml` uses `./seed/*.sql`
- local `supabase db reset` will load matching files after migrations

Rule: never add real personal health data as seed data.
