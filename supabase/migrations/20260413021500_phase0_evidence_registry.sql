create table if not exists public.evidence_sources (
  source_id text primary key,
  title text not null,
  publisher text not null,
  year integer not null check (year >= 1900 and year <= 3000),
  canonical_url_or_doi text not null,
  source_type text not null check (source_type in (
    'guideline',
    'consensus_statement',
    'systematic_review_meta',
    'primary_study',
    'narrative_review',
    'expert_synthesis',
    'regulatory_spec',
    'commercial_article',
    'media_summary',
    'placeholder'
  )),
  biomedical_evidence_class text not null check (biomedical_evidence_class in ('A', 'B', 'C', 'D')),
  authority_level text not null check (authority_level in ('very_high', 'high', 'medium', 'low', 'unusable')),
  bucket text not null check (bucket in ('strong', 'secondary', 'heuristic', 'discard')),
  main_usable_contribution text not null,
  main_weakness text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rule_evidence_links (
  rule_id text primary key,
  biomarker_or_topic text not null,
  logic text not null,
  description text not null,
  origin text not null check (origin in ('guideline_adopted', 'evidence_extrapolated', 'policy_choice', 'heuristic')),
  anchor_source_id text not null references public.evidence_sources(source_id) on delete restrict,
  supporting_source_ids jsonb not null default '[]'::jsonb,
  product_evidence_class text not null check (product_evidence_class in ('P0', 'P1', 'P2', 'P3')),
  status text not null check (status in ('active', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evidence_sources_bucket_idx
  on public.evidence_sources (bucket);

create index if not exists rule_evidence_links_anchor_source_id_idx
  on public.rule_evidence_links (anchor_source_id);

create or replace trigger evidence_sources_set_updated_at
before update on public.evidence_sources
for each row execute function public.set_updated_at();

create or replace trigger rule_evidence_links_set_updated_at
before update on public.rule_evidence_links
for each row execute function public.set_updated_at();

alter table public.evidence_sources enable row level security;
alter table public.rule_evidence_links enable row level security;

create policy "evidence sources are readable by authenticated users"
on public.evidence_sources
for select
using (auth.role() = 'authenticated');

create policy "rule evidence links are readable by authenticated users"
on public.rule_evidence_links
for select
using (auth.role() = 'authenticated');
